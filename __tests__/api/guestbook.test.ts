import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
  toBool: vi.fn((r: unknown) => r),
  toBoolAll: vi.fn((r: unknown[]) => r),
  isUniqueViolation: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

import { query, execute, generateId } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { GET, POST } from "@/app/api/v1/guestbook/route";

const mockQuery = vi.mocked(query);
const mockExecute = vi.mocked(execute);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(true);
  mockQuery.mockResolvedValue([]);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

describe("GET /api/v1/guestbook", () => {
  it("returns guest book entries", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Alice", message: "Congrats!" }]);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("returns 403 when feature is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("returns 500 on DB error", async () => {
    mockQuery.mockRejectedValue(new Error("db error"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/v1/guestbook", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/guestbook", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    });
  }

  it("creates a guest book entry", async () => {
    const res = await POST(makeReq({ name: "Bob", message: "Best wishes!" }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeReq({ name: "", message: "hi" }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 when message is missing", async () => {
    const res = await POST(makeReq({ name: "Bob", message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 403 when feature is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await POST(makeReq({ name: "Bob", message: "hi" }));
    expect(res.status).toBe(403);
  });

  it("returns 500 on DB error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await POST(makeReq({ name: "Bob", message: "hi" }));
    expect(res.status).toBe(500);
  });
});
