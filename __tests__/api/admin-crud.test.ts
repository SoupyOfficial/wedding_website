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
  mockQueryOne.mockResolvedValue(null);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

// Admin guests
import { GET as guestsGet, POST as guestsPost } from "@/app/api/v1/admin/guests/route";
// Admin messages
import { GET as messagesGet } from "@/app/api/v1/admin/messages/route";

describe("Admin Guests GET", () => {
  it("returns all guests", async () => {
    mockQuery.mockResolvedValue([{ id: "1", firstName: "John" }]);
    const res = await guestsGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await guestsGet();
    expect(res.status).toBe(500);
  });
});

describe("Admin Guests POST", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/guests", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("creates a guest", async () => {
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "Doe" }));
    expect(res.status).toBe(201);
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns 400 when firstName missing", async () => {
    const res = await guestsPost(makeReq({ firstName: "", lastName: "Doe" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when lastName missing", async () => {
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "Doe" }));
    expect(res.status).toBe(500);
  });
});

describe("Admin Guests POST duplicate prevention", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/guests", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 409 when a guest with the same first and last name exists", async () => {
    mockQueryOne.mockResolvedValueOnce({ id: "existing-id" });
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "Doe" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("already exists");
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("returns 409 when name and email both match an existing guest", async () => {
    mockQueryOne.mockResolvedValueOnce({ id: "existing-id" });
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "Doe", email: "john@example.com" }));
    expect(res.status).toBe(409);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("checks only firstName and lastName when no email is provided", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null) // duplicate check
      .mockResolvedValueOnce({ id: "new-id" }); // fetch created row
    await guestsPost(makeReq({ firstName: "John", lastName: "Doe" }));
    const [sql, args] = mockQueryOne.mock.calls[0];
    expect(sql).toBe("SELECT id FROM Guest WHERE firstName = ? AND lastName = ? LIMIT 1");
    expect(args).toEqual(["John", "Doe"]);
  });

  it("includes email in the duplicate check when one is provided", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "new-id" });
    await guestsPost(makeReq({ firstName: "John", lastName: "Doe", email: "john@example.com" }));
    const [sql, args] = mockQueryOne.mock.calls[0];
    expect(sql).toBe("SELECT id FROM Guest WHERE firstName = ? AND lastName = ? AND email = ? LIMIT 1");
    expect(args).toEqual(["John", "Doe", "john@example.com"]);
  });

  it("still creates a guest when no duplicate exists", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null) // duplicate check
      .mockResolvedValueOnce({ id: "new-id", firstName: "Jane" }); // fetch created row
    const res = await guestsPost(makeReq({ firstName: "Jane", lastName: "Doe" }));
    expect(res.status).toBe(201);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("still creates a guest with the same name but a different email", async () => {
    mockQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "new-id" });
    const res = await guestsPost(makeReq({ firstName: "John", lastName: "Doe", email: "different@example.com" }));
    expect(res.status).toBe(201);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});

describe("Admin Messages GET", () => {
  it("returns all contact messages", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Alice", subject: "Q" }]);
    const res = await messagesGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("fail"));
    const res = await messagesGet();
    expect(res.status).toBe(500);
  });
});
