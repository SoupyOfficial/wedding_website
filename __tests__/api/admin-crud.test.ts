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

import { query, execute } from "@/lib/db";
const mockQuery = vi.mocked(query);
const mockExecute = vi.mocked(execute);

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.mockResolvedValue([]);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

// Admin guest book list
import { GET as gbGet } from "@/app/api/v1/admin/guest-book/route";
// Admin guests
import { GET as guestsGet, POST as guestsPost } from "@/app/api/v1/admin/guests/route";
// Admin meals
import { GET as mealsGet, POST as mealsPost } from "@/app/api/v1/admin/meals/route";
// Admin messages
import { GET as messagesGet } from "@/app/api/v1/admin/messages/route";

describe("Admin Guest Book GET", () => {
  it("returns all entries", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Test", message: "Hello", isVisible: 1 }]);
    const res = await gbGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("fail"));
    const res = await gbGet();
    expect(res.status).toBe(500);
  });
});

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

describe("Admin Meals GET", () => {
  it("returns all meal options", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Chicken" }]);
    const res = await mealsGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await mealsGet();
    expect(res.status).toBe(500);
  });
});

describe("Admin Meals POST", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/meals", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("creates a meal option", async () => {
    const res = await mealsPost(makeReq({ name: "Chicken", description: "Grilled" }));
    expect(res.status).toBe(201);
  });

  it("creates a vegetarian meal with all boolean flags", async () => {
    const res = await mealsPost(makeReq({ name: "Salad", description: "Fresh", isVegetarian: true, isVegan: true, isGlutenFree: true }));
    expect(res.status).toBe(201);
  });

  it("returns 400 when name missing", async () => {
    const res = await mealsPost(makeReq({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await mealsPost(makeReq({ name: "Chicken" }));
    expect(res.status).toBe(500);
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
