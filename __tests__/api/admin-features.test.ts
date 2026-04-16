import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlags: vi.fn(),
  getFeatureFlag: vi.fn(),
  setFeatureFlag: vi.fn(),
  isFeatureFlagKey: vi.fn((key: string) => [
    "rsvpEnabled", "guestBookEnabled", "photoUploadEnabled", "songRequestsEnabled",
  ].includes(key)),
}));

import { getFeatureFlags, setFeatureFlag } from "@/lib/config/feature-flags";
import { GET, PUT } from "@/app/api/v1/admin/features/route";
import { NextRequest } from "next/server";

const mockGetFeatureFlags = vi.mocked(getFeatureFlags);
const mockSetFeatureFlag = vi.mocked(setFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/admin/features", () => {
  it("returns all feature flags", async () => {
    mockGetFeatureFlags.mockResolvedValue({ rsvpEnabled: true, guestBookEnabled: false } as any);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.rsvpEnabled).toBe(true);
    expect(body.data.guestBookEnabled).toBe(false);
  });

  it("returns 500 on error", async () => {
    mockGetFeatureFlags.mockRejectedValue(new Error("fail"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/v1/admin/features", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/features", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("toggles a feature flag", async () => {
    mockSetFeatureFlag.mockResolvedValue(undefined);
    mockGetFeatureFlags.mockResolvedValue({ rsvpEnabled: false } as any);
    const res = await PUT(makeReq({ key: "rsvpEnabled", enabled: false }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(mockSetFeatureFlag).toHaveBeenCalledWith("rsvpEnabled", false);
    expect(body.data.rsvpEnabled).toBe(false);
  });

  it("returns 400 when key is missing", async () => {
    const res = await PUT(makeReq({ enabled: true }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when key is not a string", async () => {
    const res = await PUT(makeReq({ key: 123, enabled: true }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown feature flag key", async () => {
    const res = await PUT(makeReq({ key: "unknownFlag", enabled: true }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Unknown feature flag");
  });

  it("returns 400 when enabled is not boolean", async () => {
    const res = await PUT(makeReq({ key: "rsvpEnabled", enabled: "yes" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on error", async () => {
    mockSetFeatureFlag.mockRejectedValueOnce(new Error("db"));
    const res = await PUT(makeReq({ key: "rsvpEnabled", enabled: true }));
    expect(res.status).toBe(500);
  });
});
