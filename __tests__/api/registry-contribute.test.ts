import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined }),
  generateId: vi.fn().mockReturnValue("contrib-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
  toBool: vi.fn((r: unknown) => r),
  toBoolAll: vi.fn((r: unknown[]) => r),
}));

import { query, queryOne, execute } from "@/lib/db";
const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);

beforeEach(() => {
  vi.resetAllMocks();
  mockQuery.mockResolvedValue([]);
  mockQueryOne.mockResolvedValue(null);
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
});

function makeReq(body: unknown) {
  return new NextRequest("http://localhost:3000/api/v1/registry/contribute", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });

// ─── Guest Contribute Route ────────────────────────────────────
import { POST as contribute } from "@/app/api/v1/registry/contribute/route";

const activeFund = {
  id: "fund-1", name: "Honeymoon Fund", itemType: "fund",
  status: "active", goalAmount: 1000, raisedAmount: 200,
  url: "https://venmo.com/couple", totalNeeded: null, totalBought: 0,
};

const activeProduct = {
  id: "prod-1", name: "KitchenAid Mixer", itemType: "product",
  status: "active", goalAmount: null, raisedAmount: 0,
  url: "https://amazon.com/mixer", totalNeeded: 2, totalBought: 0,
  price: 299.99,
};

const storeItem = {
  id: "store-1", name: "Amazon", itemType: "store",
  status: "active", goalAmount: null, raisedAmount: 0,
  url: "https://amazon.com/registry", totalNeeded: null, totalBought: 0,
};

describe("Guest Registry Contribute", () => {
  // ─── Validation ─────────────────────────────────────────
  it("returns 400 when id is missing", async () => {
    const res = await contribute(makeReq({ amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await contribute(makeReq({ id: "fund-1", guestName: "Jane" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is zero", async () => {
    const res = await contribute(makeReq({ id: "fund-1", amount: 0, guestName: "Jane" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is negative", async () => {
    const res = await contribute(makeReq({ id: "fund-1", amount: -10, guestName: "Jane" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when guestName is missing", async () => {
    const res = await contribute(makeReq({ id: "fund-1", amount: 50 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when guestName is blank", async () => {
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when item not found", async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    const res = await contribute(makeReq({ id: "nope", amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(404);
  });

  // ─── Status checks ─────────────────────────────────────
  it("returns 400 when item is fulfilled", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, status: "fulfilled" });
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("no longer accepting");
  });

  it("returns 400 when item is hidden", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, status: "hidden" });
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(400);
  });

  // ─── Store items ────────────────────────────────────────
  it("returns 400 when contributing to a store link", async () => {
    mockQueryOne.mockResolvedValueOnce(storeItem);
    const res = await contribute(makeReq({ id: "store-1", amount: 1, guestName: "Jane" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Store links");
  });

  // ─── Fund contributions ─────────────────────────────────
  it("accepts a valid fund contribution", async () => {
    mockQueryOne.mockResolvedValueOnce(activeFund);
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane Doe" }));
    expect(res.status).toBe(200);
    // Should update raisedAmount and insert contribution
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("accepts fund contribution with email", async () => {
    mockQueryOne.mockResolvedValueOnce(activeFund);
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane", guestEmail: "jane@test.com" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 when fund contribution exceeds remaining goal", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, raisedAmount: 950 });
    const res = await contribute(makeReq({ id: "fund-1", amount: 100, guestName: "Jane" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("exceeds");
  });

  it("returns 400 when fund already reached goal", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, raisedAmount: 1000 });
    const res = await contribute(makeReq({ id: "fund-1", amount: 10, guestName: "Jane" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("reached its goal");
  });

  it("auto-fulfills fund when goal is reached", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, raisedAmount: 950, goalAmount: 1000 });
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(200);
    // 3 calls: update raisedAmount, set status to fulfilled, insert contribution
    expect(mockExecute).toHaveBeenCalledTimes(3);
    // Verify the fulfillment update was called
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("status = 'fulfilled'"),
      expect.arrayContaining(["fund-1"])
    );
  });

  it("accepts fund contribution when no goal is set", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeFund, goalAmount: null });
    const res = await contribute(makeReq({ id: "fund-1", amount: 500, guestName: "Jane" }));
    expect(res.status).toBe(200);
  });

  // ─── Product contributions ──────────────────────────────
  it("accepts a valid product purchase", async () => {
    mockQueryOne.mockResolvedValueOnce(activeProduct);
    const res = await contribute(makeReq({ id: "prod-1", amount: 1, guestName: "John Doe" }));
    expect(res.status).toBe(200);
    // Should update totalBought and insert contribution
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("returns 400 when product is fully purchased", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeProduct, totalBought: 2, totalNeeded: 2 });
    const res = await contribute(makeReq({ id: "prod-1", amount: 1, guestName: "John" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("fully purchased");
  });

  it("auto-fulfills product when last unit is purchased", async () => {
    mockQueryOne.mockResolvedValueOnce({ ...activeProduct, totalBought: 1, totalNeeded: 2 });
    const res = await contribute(makeReq({ id: "prod-1", amount: 1, guestName: "John" }));
    expect(res.status).toBe(200);
    // 3 calls: update totalBought, set status to fulfilled, insert contribution
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("status = 'fulfilled'"),
      expect.arrayContaining(["prod-1"])
    );
  });

  // ─── Error handling ─────────────────────────────────────
  it("returns 500 on database error", async () => {
    mockQueryOne.mockResolvedValueOnce(activeFund);
    mockExecute.mockRejectedValueOnce(new Error("db fail"));
    const res = await contribute(makeReq({ id: "fund-1", amount: 50, guestName: "Jane" }));
    expect(res.status).toBe(500);
  });
});

// ─── Admin Contributions GET Route ────────────────────────────
import { GET as getContributions } from "@/app/api/v1/admin/registry/[id]/contributions/route";

describe("Admin Registry Contributions", () => {
  it("returns contributions for an item", async () => {
    mockQuery.mockResolvedValueOnce([
      { id: "c1", registryItemId: "fund-1", guestName: "Jane", guestEmail: null, amount: 50, status: "confirmed", createdAt: "2026-06-10" },
      { id: "c2", registryItemId: "fund-1", guestName: "John", guestEmail: "john@test.com", amount: 100, status: "confirmed", createdAt: "2026-06-11" },
    ]);
    const res = await getContributions(new Request("http://l"), params("fund-1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].guestName).toBe("Jane");
  });

  it("returns empty array when no contributions", async () => {
    mockQuery.mockResolvedValueOnce([]);
    const res = await getContributions(new Request("http://l"), params("fund-1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });

  it("returns 500 on database error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));
    const res = await getContributions(new Request("http://l"), params("fund-1"));
    expect(res.status).toBe(500);
  });
});
