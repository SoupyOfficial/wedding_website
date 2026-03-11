import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
  toBool: vi.fn((r: unknown) => r),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/events/event-bus", () => ({
  eventBus: { emit: vi.fn() },
}));

import { queryOne, execute } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { eventBus } from "@/lib/events/event-bus";
import { POST } from "@/app/api/v1/rsvp/submit/route";

const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(true);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

function makeReq(body: unknown) {
  return new NextRequest("http://localhost:3000/api/v1/rsvp/submit", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
  });
}

describe("POST /api/v1/rsvp/submit", () => {
  const guest = {
    id: "g1",
    firstName: "John",
    lastName: "Doe",
    rsvpStatus: "attending",
    plusOneAllowed: 1,
    plusOneAttending: 0,
  };

  it("submits an RSVP successfully", async () => {
    mockQueryOne.mockResolvedValue(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.rsvpStatus).toBe("attending");
    expect(eventBus.emit).toHaveBeenCalledWith("rsvp:submitted", expect.objectContaining({ guestId: "g1" }));
  });

  it("submits RSVP with all optional fields", async () => {
    mockQueryOne.mockResolvedValue(guest);
    const res = await POST(makeReq({
      guestId: "g1", attending: true,
      email: "j@d.com", phone: "555-1234", dietaryNotes: "Vegan",
      plusOneName: "Jane", mealOptionId: "m1",
    }));
    expect(res.status).toBe(200);
  });

  it("returns 400 when guestId missing", async () => {
    const res = await POST(makeReq({ attending: true }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when attending is not boolean", async () => {
    const res = await POST(makeReq({ guestId: "g1", attending: "yes" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when guest not found after update", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await POST(makeReq({ guestId: "missing", attending: true }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when RSVP is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(403);
  });

  it("creates song request when attending and songRequest provided", async () => {
    mockQueryOne.mockResolvedValue(guest);
    await POST(makeReq({ guestId: "g1", attending: true, songRequest: "My Song", songArtist: "Band" }));
    // execute should be called at least twice: UPDATE guest + INSERT song
    expect(mockExecute.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("does not create song request when declining", async () => {
    mockQueryOne.mockResolvedValue({ ...guest, rsvpStatus: "declined" });
    await POST(makeReq({ guestId: "g1", attending: false, songRequest: "My Song" }));
    // execute should only be called once (the UPDATE)
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(500);
  });
});
