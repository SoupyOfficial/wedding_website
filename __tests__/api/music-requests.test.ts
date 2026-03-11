import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
  isUniqueViolation: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/config/feature-flags", () => ({
  getFeatureFlag: vi.fn().mockResolvedValue(true),
}));

import { query, queryOne, execute } from "@/lib/db";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { GET, POST } from "@/app/api/v1/music/requests/route";

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockGetFeatureFlag = vi.mocked(getFeatureFlag);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(true);
  mockQuery.mockResolvedValue([]);
  mockQueryOne.mockResolvedValue(null);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

describe("GET /api/v1/music/requests", () => {
  it("returns approved song requests", async () => {
    mockQuery.mockResolvedValue([{ id: "1", songTitle: "Song", artist: "Artist" }]);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 403 when feature is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/v1/music/requests", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/music/requests", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("creates a song request", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null) // no duplicate
      .mockResolvedValueOnce({ id: "test-id", songTitle: "Song" }); // fetch created
    const res = await POST(makeReq({ guestName: "Alice", songTitle: "Song", artist: "Artist" }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 400 when guestName missing", async () => {
    const res = await POST(makeReq({ guestName: "", songTitle: "Song" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when songTitle missing", async () => {
    const res = await POST(makeReq({ guestName: "Alice", songTitle: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate request", async () => {
    mockQueryOne.mockResolvedValueOnce({ id: "existing" }); // duplicate found
    const res = await POST(makeReq({ guestName: "Alice", songTitle: "Song" }));
    expect(res.status).toBe(409);
  });

  it("returns 403 when feature is disabled", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    const res = await POST(makeReq({ guestName: "Alice", songTitle: "Song" }));
    expect(res.status).toBe(403);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    mockQueryOne.mockResolvedValueOnce(null); // no duplicate
    const res = await POST(makeReq({ guestName: "Alice", songTitle: "Song" }));
    expect(res.status).toBe(500);
  });
});
