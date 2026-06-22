import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => async () => null, // no-op rate limiter for tests
}));

import { queryOne } from "@/lib/db";
import { GET } from "@/app/api/v1/settings/public/route";

const mockQueryOne = vi.mocked(queryOne);

function mockReq() {
  return new NextRequest("http://localhost:3000/api/v1/settings/public");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/settings/public", () => {
  it("returns non-sensitive settings", async () => {
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      coupleName: "Alice & Bob",
      weddingDate: "2026-10-01",
      weddingHashtag: "#AliceAndBob",
      venueName: "The Venue",
      venueAddress: "123 Main St",
      contactEmailJoint: "us@example.com",
      contactEmailBride: null,
      contactEmailGroom: null,
      socialInstagram: null,
      socialFacebook: null,
      socialTikTok: null,
      heroTagline: "Together forever",
      ceremonyType: "outdoor",
      // sensitive fields that should NOT be returned
      adminEmail: "admin@secret.com",
      sitePassword: "supersecret",
    });

    const res = await GET(mockReq());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.coupleName).toBe("Alice & Bob");
    expect(body.data.venueName).toBe("The Venue");
    // Should NOT expose sensitive fields
    expect(body.data.adminEmail).toBeUndefined();
    expect(body.data.sitePassword).toBeUndefined();
  });

  it("returns 404 when settings not found", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await GET(mockReq());
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockQueryOne.mockRejectedValue(new Error("db failure"));
    const res = await GET(mockReq());
    expect(res.status).toBe(500);
  });
});
