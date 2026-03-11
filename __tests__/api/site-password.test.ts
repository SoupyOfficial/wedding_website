import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}));

import { queryOne } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);

import { POST } from "@/app/api/v1/site-password/route";

function makeReq(body: unknown) {
  return new NextRequest("http://l/api/v1/site-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Site Password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns verified when password not enabled", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", sitePasswordEnabled: false, sitePassword: null });
    const res = await POST(makeReq({ password: "" }));
    const data = await res.json();
    expect(data.data.verified).toBe(true);
  });

  it("returns verified for correct password", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", sitePasswordEnabled: true, sitePassword: "secret123" });
    const res = await POST(makeReq({ password: "secret123" }));
    const data = await res.json();
    expect(data.data.verified).toBe(true);
  });

  it("returns 401 for incorrect password", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", sitePasswordEnabled: true, sitePassword: "secret123" });
    const res = await POST(makeReq({ password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns verified when no settings found and thus no password", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await POST(makeReq({ password: "" }));
    const data = await res.json();
    expect(data.data.verified).toBe(true);
  });

  it("returns 500 on error", async () => {
    mockQueryOne.mockRejectedValueOnce(new Error("db"));
    const res = await POST(makeReq({ password: "x" }));
    expect(res.status).toBe(500);
  });
});
