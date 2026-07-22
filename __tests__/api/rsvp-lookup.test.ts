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

function makeReq(name: string) {
  return new NextRequest(`http://localhost:3000/api/v1/rsvp/lookup?name=${encodeURIComponent(name)}`, {
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
    plusOneName: null,
    plusOneMealPreference: null,
    mealPreference: null,
    dietaryNeeds: null,
    songRequest: null,
  };

  const mealOptions = [
    { id: "m1", name: "Steak", description: "Grilled", isVegetarian: 0, isVegan: 0, isGlutenFree: 0, isAvailable: 1, sortOrder: 1 },
    { id: "m2", name: "Salmon", description: "Pan-seared", isVegetarian: 0, isVegan: 0, isGlutenFree: 0, isAvailable: 1, sortOrder: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFeatureFlag.mockResolvedValue(true);
    mockQuery.mockResolvedValue([]);
  });

  it("returns guest data when found", async () => {
    mockQueryOne.mockResolvedValue(fullGuest);
    const res = await GET(makeReq("John Doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.firstName).toBe("John");
    expect(body.data.guest.lastName).toBe("Doe");
  });

  it("returns meal options alongside guest data", async () => {
    mockQueryOne.mockResolvedValue(fullGuest);
    mockQuery.mockResolvedValue(mealOptions);
    const res = await GET(makeReq("John Doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.mealOptions).toBeDefined();
    expect(body.data.mealOptions.length).toBe(2);
    expect(body.data.mealOptions[0].name).toBe("Steak");
  });

  it("returns plusOneMealPreference in guest result", async () => {
    mockQueryOne.mockResolvedValue({
      ...fullGuest,
      plusOneMealPreference: "m1",
    });
    const res = await GET(makeReq("John Doe"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.guest.plusOneMealPreference).toBe("m1");
  });

  it("returns dietaryNeeds and songRequest in guest result", async () => {
    mockQueryOne.mockResolvedValue({
      ...fullGuest,
      dietaryNeeds: "Gluten-free",
      songRequest: "Dancing Queen",
    });
    const res = await GET(makeReq("John Doe"));
    const body = await res.json();
    expect(body.data.guest.dietaryNeeds).toBe("Gluten-free");
    expect(body.data.guest.songRequest).toBe("Dancing Queen");
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

  it("returns 400 when name is only whitespace", async () => {
    const res = await GET(makeReq("  "));
    expect(res.status).toBe(400);
  });

  it("returns 403 when RSVP is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await GET(makeReq("John Doe"));
    expect(res.status).toBe(403);
  });

  it("searches by first name only when no last name", async () => {
    mockQueryOne.mockResolvedValue(fullGuest);
    const res = await GET(makeReq("John"));
    expect(res.status).toBe(200);
    expect(mockQueryOne).toHaveBeenCalled();
  });

  it("searches by full name with extra whitespace", async () => {
    mockQueryOne.mockResolvedValue(fullGuest);
    const res = await GET(makeReq("  John   Doe  "));
    expect(res.status).toBe(200);
  });

  it("returns 500 on DB error", async () => {
    mockQueryOne.mockRejectedValueOnce(new Error("db"));
    const res = await GET(makeReq("John Doe"));
    expect(res.status).toBe(500);
  });

  it("returns 500 when meal options query fails", async () => {
    mockQueryOne.mockResolvedValue(fullGuest);
    mockQuery.mockRejectedValueOnce(new Error("db error in meals"));
    const res = await GET(makeReq("John Doe"));
    expect(res.status).toBe(500);
  });
});
