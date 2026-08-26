import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
  toBoolAll: vi.fn((r: unknown[]) => r),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

import { query } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { GET } from "@/app/api/v1/rsvp/lookup/route";
import { lookupGuest } from "@/lib/services/rsvp.service";

const mockQuery = vi.mocked(query);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

function makeReq(firstName: string, lastName: string) {
  return new NextRequest(
    `http://localhost:3000/api/v1/rsvp/lookup?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`,
    { headers: { "x-forwarded-for": "127.0.0.1" } }
  );
}

function makeReqMissing(param: "firstName" | "lastName") {
  const qs = param === "firstName" ? "lastName=Doe" : "firstName=John";
  return new NextRequest(`http://localhost:3000/api/v1/rsvp/lookup?${qs}`, {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

describe("GET /api/v1/rsvp/lookup", () => {
  const fullGuest = {
    id: "g1",
    firstName: "John",
    lastName: "Doe",
    rsvpStatus: "pending",
    plusOneAllowed: 1,
    plusOneAttending: 0,
    plusOneName: null,
    dietaryNeeds: null,
    songRequest: null,
    danceSong: null,
    firstDanceSong: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFeatureFlag.mockResolvedValue(true);
    mockQuery.mockReset();
  });

  it("returns guest data when found", async () => {
    mockQuery.mockResolvedValueOnce([fullGuest]);
    const res = await GET(makeReq("John", "Doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.firstName).toBe("John");
    expect(body.data.guest.lastName).toBe("Doe");
  });

  it("returns dietaryNeeds and songRequest in guest result", async () => {
    mockQuery.mockResolvedValueOnce([{ ...fullGuest, dietaryNeeds: "Gluten-free", songRequest: "Dancing Queen" }]);
    const res = await GET(makeReq("John", "Doe"));
    const body = await res.json();
    expect(body.data.guest.dietaryNeeds).toBe("Gluten-free");
    expect(body.data.guest.songRequest).toBe("Dancing Queen");
  });

  it("returns 404 when guest not found", async () => {
    mockQuery.mockResolvedValueOnce([]);
    const res = await GET(makeReq("Unknown", "Person"));
    expect(res.status).toBe(404);
  });

  // ── Strict name gate (guest-list lock) ──

  it("returns null when firstName is empty — no guest, no query", async () => {
    const result = await lookupGuest("", "Doe");
    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns null when lastName is whitespace-only — no guest, no query", async () => {
    const result = await lookupGuest("John", "   ");
    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when name is not an exact match (partial name)", async () => {
    mockQuery.mockResolvedValueOnce([]); // "Rob" does not match guest "Robert"
    const res = await GET(makeReq("Rob", "Doe"));
    expect(res.status).toBe(404);
    // Exact equality only — no partial/LIKE matching
    expect(mockQuery.mock.calls[0][0]).not.toContain("LIKE");
    expect(mockQuery.mock.calls[0][1]).toEqual(["Rob", "Doe"]);
  });

  it("returns 400 when firstName is missing", async () => {
    const res = await GET(makeReqMissing("firstName"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lastName is missing", async () => {
    const res = await GET(makeReqMissing("lastName"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when both params are missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/rsvp/lookup", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when firstName is only whitespace", async () => {
    const res = await GET(makeReq("  ", "Doe"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lastName is only whitespace", async () => {
    const res = await GET(makeReq("John", "  "));
    expect(res.status).toBe(400);
  });

  it("returns 403 when RSVP is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await GET(makeReq("John", "Doe"));
    expect(res.status).toBe(403);
  });

  it("performs case-insensitive exact match", async () => {
    mockQuery.mockResolvedValueOnce([fullGuest]);
    const res = await GET(makeReq("john", "doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.firstName).toBe("John");
    // Verify the SQL used LOWER() for case-insensitivity
    expect(mockQuery.mock.calls[0][0]).toContain("LOWER(firstName)");
    expect(mockQuery.mock.calls[0][0]).toContain("LOWER(lastName)");
    expect(mockQuery.mock.calls[0][1]).toEqual(["john", "doe"]);
  });

  it("returns 404 when multiple guests share the exact same name", async () => {
    mockQuery.mockResolvedValueOnce([
      { ...fullGuest, id: "g1" },
      { ...fullGuest, id: "g2", email: "other@test.com" },
    ]);
    const res = await GET(makeReq("John", "Doe"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on DB error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await GET(makeReq("John", "Doe"));
    expect(res.status).toBe(500);
  });
});
