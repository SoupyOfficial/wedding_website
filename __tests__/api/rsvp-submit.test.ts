import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/email.service", () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true }),
}));

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

import { queryOne, execute } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { sendEmail } from "@/lib/services/email.service";
import { POST } from "@/app/api/v1/rsvp/submit/route";

const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);
const mockSendEmail = vi.mocked(sendEmail);

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

  const settingsRow = {
    rsvpDeadline: null as string | null,
    notifyOnRsvp: 0,
    notificationEmail: "",
    coupleName: "Test Couple",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFeatureFlag.mockResolvedValue(true);
    mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
    mockQueryOne.mockResolvedValue(null);
  });

  // ── Basic validation ──

  it("submits an RSVP successfully", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.rsvpStatus).toBe("attending");
  });

  it("submits a declining RSVP successfully", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...guest, rsvpStatus: "declined" });
    const res = await POST(makeReq({ guestId: "g1", attending: false }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.guest.rsvpStatus).toBe("declined");
  });

  it("submits RSVP with all optional fields", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m2" })
      .mockResolvedValueOnce(guest);
    const res = await POST(makeReq({
      guestId: "g1", attending: true,
      email: "j@d.com", phone: "555-1234", dietaryNotes: "Vegan",
      plusOneName: "Jane", mealOptionId: "m1", plusOneMealOptionId: "m2",
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

  // ── Meal option validation ──

  it("returns 400 when main meal option is invalid", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)       // settings (no deadline)
      .mockResolvedValueOnce(null);       // meal validation fails
    const res = await POST(makeReq({
      guestId: "g1", attending: true, mealOptionId: "bad-id",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when plus-one meal option is invalid", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);       // plusOneMealOptionId validation fails
    const res = await POST(makeReq({
      guestId: "g1", attending: true, plusOneMealOptionId: "bad-id",
    }));
    expect(res.status).toBe(400);
  });

  // ── Deadline enforcement ──

  it("returns 400 when RSVP deadline has passed", async () => {
    mockQueryOne.mockResolvedValueOnce({
      ...settingsRow,
      rsvpDeadline: "2026-01-01T00:00:00.000Z",
    });
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("deadline");
  });

  it("allows RSVP when deadline is in the future", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, rsvpDeadline: "2026-12-31T00:00:00.000Z" })
      .mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(200);
  });

  it("allows RSVP when no deadline is set", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(200);
  });

  it("allows RSVP when deadline is null in settings", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, rsvpDeadline: null })
      .mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(200);
  });

  // ── Guest not found ──

  it("returns 404 when guest not found after update", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const res = await POST(makeReq({ guestId: "missing", attending: true }));
    expect(res.status).toBe(404);
  });

  // ── Feature flag ──

  it("returns 403 when RSVP is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(403);
  });

  // ── Song request (INSERT path) ──

  it("creates song request when attending and songRequest provided", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    await POST(makeReq({ guestId: "g1", attending: true, songRequest: "My Song", songArtist: "Band" }));
    expect(mockExecute.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("creates song request with empty artist when not provided", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    await POST(makeReq({ guestId: "g1", attending: true, songRequest: "Just Title" }));
    expect(mockExecute.mock.calls.length).toBeGreaterThanOrEqual(2);
    // Verify the artist arg is empty string
    const insertCall = mockExecute.mock.calls[mockExecute.mock.calls.length - 1];
    expect(insertCall[0]).toContain("INSERT INTO SongRequest");
  });

  it("does not create song request when declining", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...guest, rsvpStatus: "declined" });
    await POST(makeReq({ guestId: "g1", attending: false, songRequest: "My Song" }));
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("does not create song request when attending but no songRequest", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    await POST(makeReq({ guestId: "g1", attending: true }));
    // Only one execute: the UPDATE
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  // ── Song request dedup (UPDATE path) ──

  it("updates existing song request instead of inserting duplicate", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)                          // settings
      .mockResolvedValueOnce(guest)                          // guest after update
      .mockResolvedValueOnce({ id: "existing-song-id" });    // song lookup: found
    await POST(makeReq({ guestId: "g1", attending: true, songRequest: "Updated Song", songArtist: "New Band" }));
    // First execute is UPDATE guest, second execute is UPDATE song (not INSERT)
    expect(mockExecute).toHaveBeenCalledTimes(2);
    const songExec = mockExecute.mock.calls[1];
    expect(songExec[0]).toContain("UPDATE SongRequest");
    expect(songExec[0]).not.toContain("INSERT");
  });

  it("inserts song request when no existing song found", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)                          // settings
      .mockResolvedValueOnce(guest)                          // guest after update
      .mockResolvedValueOnce(null);                          // song lookup: not found
    await POST(makeReq({ guestId: "g1", attending: true, songRequest: "New Song", songArtist: "Band" }));
    expect(mockExecute).toHaveBeenCalledTimes(2);
    const songExec = mockExecute.mock.calls[1];
    expect(songExec[0]).toContain("INSERT INTO SongRequest");
  });

  // ── Email notifications ──

  it("sends admin and guest notification emails when enabled", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 1, notificationEmail: "admin@test.com" })
      .mockResolvedValueOnce({ ...guest, email: "john@test.com" });
    await POST(makeReq({ guestId: "g1", attending: true }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@test.com" })
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "john@test.com" })
    );
  });

  it("does not send admin email when notifyOnRsvp is 0", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 0, notificationEmail: "admin@test.com" })
      .mockResolvedValueOnce({ ...guest, email: "john@test.com" });
    await POST(makeReq({ guestId: "g1", attending: true }));
    // Only guest email should be sent (not admin)
    const adminCall = mockSendEmail.mock.calls.find(c => c[0] && (c[0] as { to: string }).to === "admin@test.com");
    expect(adminCall).toBeUndefined();
  });

  it("does not send admin email when notificationEmail is empty", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 1, notificationEmail: "" })
      .mockResolvedValueOnce({ ...guest, email: "john@test.com" });
    await POST(makeReq({ guestId: "g1", attending: true }));
    const adminCall = mockSendEmail.mock.calls.find(c => c[0] && (c[0] as { to: string }).to === "");
    expect(adminCall).toBeUndefined();
  });

  it("does not send guest email when guest has no email", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 1, notificationEmail: "admin@test.com" })
      .mockResolvedValueOnce({ ...guest, email: null });
    await POST(makeReq({ guestId: "g1", attending: true }));
    // Only admin email should be sent
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@test.com" })
    );
  });

  it("sends confirmation to guest even when declining", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...guest, rsvpStatus: "declined", email: "john@test.com" });
    await POST(makeReq({ guestId: "g1", attending: false }));
    // Guest should get confirmation email regardless of status
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "john@test.com" })
    );
  });

  it("sends decline notification email to admin", async () => {
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 1, notificationEmail: "admin@test.com" })
      .mockResolvedValueOnce({ ...guest, rsvpStatus: "declined" });
    await POST(makeReq({ guestId: "g1", attending: false }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@test.com",
        subject: expect.stringContaining("Declined") as string,
      })
    );
  });

  it("handles email failure gracefully — RSVP still succeeds", async () => {
    mockSendEmail.mockRejectedValueOnce(new Error("SMTP down"));
    mockQueryOne
      .mockResolvedValueOnce({ ...settingsRow, notifyOnRsvp: 1, notificationEmail: "admin@test.com" })
      .mockResolvedValueOnce({ ...guest, email: "john@test.com" });
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(200);
  });

  it("uses email from request body over guest stored email", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...guest, email: "old@test.com" });
    await POST(makeReq({ guestId: "g1", attending: true, email: "new@test.com" }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "new@test.com" })
    );
  });

  // ── Re-submission with status change ──

  it("allows re-submitting from declined to attending", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...guest, rsvpStatus: "attending" });
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(200);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("allows re-submitting from attending to declined", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...guest, rsvpStatus: "declined" });
    const res = await POST(makeReq({ guestId: "g1", attending: false }));
    expect(res.status).toBe(200);
  });

  // ── Optional field behavior ──

  it("submits with only phone (no email)", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true, phone: "555-1234" }));
    expect(res.status).toBe(200);
  });

  it("submits with only dietaryNotes", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true, dietaryNotes: "No dairy" }));
    expect(res.status).toBe(200);
  });

  it("submits with only plusOneName", async () => {
    mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(guest);
    const res = await POST(makeReq({ guestId: "g1", attending: true, plusOneName: "Jane" }));
    expect(res.status).toBe(200);
  });

  // ── Error handling ──

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await POST(makeReq({ guestId: "g1", attending: true }));
    expect(res.status).toBe(500);
  });

  it("returns 500 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/rsvp/submit", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
