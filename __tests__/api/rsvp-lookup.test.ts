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

import { queryOne, query } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { GET } from "@/app/api/v1/rsvp/lookup/route";

const mockQueryOne = vi.mocked(queryOne);
const mockQuery = vi.mocked(query);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(true);
  mockQuery.mockResolvedValue([]);
});

function makeReq(name: string) {
  return new NextRequest(`http://localhost:3000/api/v1/rsvp/lookup?name=${encodeURIComponent(name)}`, {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

describe("GET /api/v1/rsvp/lookup", () => {
  it("returns guest data when found", async () => {
    mockQueryOne.mockResolvedValue({
      id: "g1",
      firstName: "John",
      lastName: "Doe",
      rsvpStatus: "pending",
      plusOneAllowed: 1,
      plusOneName: null,
      mealPreference: null,
      dietaryNeeds: null,
      songRequest: null,
    });
    mockQuery.mockResolvedValue([]);
    const res = await GET(makeReq("John Doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.firstName).toBe("John");
  });

  it("returns 404 when guest not found", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await GET(makeReq("Unknown Person"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when name is too short", async () => {
    const res = await GET(makeReq("A"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/rsvp/lookup", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 when RSVP is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await GET(makeReq("John Doe"));
    expect(res.status).toBe(403);
  });

  it("searches by first name only when no last name", async () => {
    mockQueryOne.mockResolvedValue({
      id: "g1",
      firstName: "John",
      lastName: "Doe",
      rsvpStatus: "pending",
      plusOneAllowed: 0,
    });
    mockQuery.mockResolvedValue([]);
    const res = await GET(makeReq("John"));
    expect(res.status).toBe(200);
    // queryOne should have been called with firstName OR lastName pattern
    expect(mockQueryOne).toHaveBeenCalled();
  });

  it("returns 500 on error", async () => {
    mockQueryOne.mockRejectedValueOnce(new Error("db"));
    const res = await GET(makeReq("John Doe"));
    expect(res.status).toBe(500);
  });
});
