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
}));

import { query, queryOne, execute } from "@/lib/db";
const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.mockResolvedValue([]);
  mockQueryOne.mockResolvedValue({ id: "test-id", name: "Test Hotel" });
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

function jsonReq(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ─── Hotels (collection) ──────────────────────────
import { GET as hotelsGet, POST as hotelsPost } from "@/app/api/v1/admin/hotels/route";

describe("Admin Hotels GET", () => {
  it("returns all hotels", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Hilton" }]);
    const res = await hotelsGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await hotelsGet();
    expect(res.status).toBe(500);
  });
});

describe("Admin Hotels POST", () => {
  it("creates hotel", async () => {
    const res = await hotelsPost(jsonReq("http://l", { name: "Hilton", address: "123 Main St", priceRange: "$150/night" }));
    expect(res.status).toBe(201);
  });

  it("returns 400 for missing name", async () => {
    const res = await hotelsPost(jsonReq("http://l", { address: "123 Main" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await hotelsPost(jsonReq("http://l", { name: "Hotel" }));
    expect(res.status).toBe(500);
  });
});

// ─── Hotels [id] ──────────────────────────────────
import { PUT as hotelPut, DELETE as hotelDel } from "@/app/api/v1/admin/hotels/[id]/route";

describe("Admin Hotels PUT", () => {
  it("updates hotel", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated Hotel", priceRange: "$200/night" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await hotelPut(req, params("1"));
    expect(res.status).toBe(200);
  });

  it("returns 400 for empty update", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await hotelPut(req, params("1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await hotelPut(req, params("999"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await hotelPut(req, params("1"));
    expect(res.status).toBe(500);
  });
});

describe("Admin Hotels DELETE", () => {
  it("deletes hotel", async () => {
    const res = await hotelDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await hotelDel(new Request("http://l"), params("999"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await hotelDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Entertainment (collection) ───────────────────
import { GET as entertainmentGet, POST as entertainmentPost } from "@/app/api/v1/admin/entertainment/route";

describe("Admin Entertainment GET", () => {
  it("returns all items", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Photo Booth" }]);
    const res = await entertainmentGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await entertainmentGet();
    expect(res.status).toBe(500);
  });
});

describe("Admin Entertainment POST", () => {
  it("creates entertainment", async () => {
    const res = await entertainmentPost(jsonReq("http://l", { name: "Photo Booth", description: "Fun pictures!" }));
    expect(res.status).toBe(201);
  });

  it("returns 400 for missing name", async () => {
    const res = await entertainmentPost(jsonReq("http://l", { description: "Something fun" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await entertainmentPost(jsonReq("http://l", { name: "Party" }));
    expect(res.status).toBe(500);
  });
});

// ─── Entertainment [id] ───────────────────────────
import { PUT as entertainmentPut, DELETE as entertainmentDel } from "@/app/api/v1/admin/entertainment/[id]/route";

describe("Admin Entertainment PUT", () => {
  it("updates entertainment", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated Booth" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await entertainmentPut(req, params("1"));
    expect(res.status).toBe(200);
  });

  it("returns 400 for empty update", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await entertainmentPut(req, params("1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await entertainmentPut(req, params("999"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await entertainmentPut(req, params("1"));
    expect(res.status).toBe(500);
  });
});

describe("Admin Entertainment DELETE", () => {
  it("deletes entertainment", async () => {
    const res = await entertainmentDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await entertainmentDel(new Request("http://l"), params("999"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await entertainmentDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});
