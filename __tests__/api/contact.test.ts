import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/api/middleware", () => ({
  rateLimit: () => vi.fn().mockResolvedValue(null),
}));

import { execute } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { POST } from "@/app/api/v1/contact/route";

const mockExecute = vi.mocked(execute);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(true);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

function makeReq(body: unknown) {
  return new NextRequest("http://localhost:3000/api/v1/contact", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
  });
}

describe("POST /api/v1/contact", () => {
  const validBody = {
    name: "Alice",
    email: "alice@example.com",
    subject: "Question",
    message: "Hello there!",
  };

  it("creates a contact message", async () => {
    const res = await POST(makeReq(validBody));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeReq({ ...validBody, name: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeReq({ ...validBody, email: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when subject is missing", async () => {
    const res = await POST(makeReq({ ...validBody, subject: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is missing", async () => {
    const res = await POST(makeReq({ ...validBody, message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 403 when feature is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(403);
  });

  it("returns 500 on DB error", async () => {
    mockExecute.mockRejectedValue(new Error("db error"));
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(500);
  });
});
