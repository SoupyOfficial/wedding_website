import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined }),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
  toBool: vi.fn((r: unknown) => r),
  toBoolAll: vi.fn((r: unknown[]) => r),
  isUniqueViolation: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/providers", () => ({
  getProvider: vi.fn().mockReturnValue({
    delete: vi.fn().mockResolvedValue(undefined),
    upload: vi.fn().mockResolvedValue({ url: "http://url", key: "key" }),
  }),
}));

import { queryOne, execute } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);

beforeEach(() => {
  vi.clearAllMocks();
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
  mockQueryOne.mockResolvedValue({ id: "1" });
});

function jsonReq(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });

// ─── Registry [id] ──────────────────────────────────
import { PUT as registryPut, DELETE as registryDel } from "@/app/api/v1/admin/registry/[id]/route";

describe("Admin Registry [id]", () => {
  it("PUT updates successfully", async () => {
    const res = await registryPut(jsonReq("http://l/api", { name: "Target" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await registryPut(jsonReq("http://l/api", { name: "Target", url: "http://x", iconUrl: "http://i", sortOrder: 2 }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 400 for empty body", async () => {
    const res = await registryPut(jsonReq("http://l/api", {}), params("1"));
    expect(res.status).toBe(400);
  });
  it("PUT returns 404 if not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await registryPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes item", async () => {
    const res = await registryDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404 if not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await registryDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await registryPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await registryDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Wedding Party [id] ────────────────────────────
import { PUT as wpPut, DELETE as wpDel } from "@/app/api/v1/admin/wedding-party/[id]/route";

describe("Admin Wedding Party [id]", () => {
  it("PUT updates member", async () => {
    const res = await wpPut(jsonReq("http://l/api", { name: "John", role: "Best Man" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await wpPut(jsonReq("http://l/api", {
      name: "John", role: "Best Man", side: "groom", bio: "A bio",
      photoUrl: "http://img.jpg", sortOrder: 2,
      relationToBrideOrGroom: "Brother", spouseOrPartner: "Jane"
    }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 404 if not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await wpPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes member", async () => {
    const res = await wpDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await wpDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await wpPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await wpDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── FAQ [id] ──────────────────────────────────────
import { PUT as faqPut, DELETE as faqDel } from "@/app/api/v1/admin/content/faqs/[id]/route";

describe("Admin FAQ [id]", () => {
  it("PUT updates FAQ", async () => {
    const res = await faqPut(jsonReq("http://l/api", { question: "Q?", answer: "A" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 400 for empty body", async () => {
    const res = await faqPut(jsonReq("http://l/api", {}), params("1"));
    expect(res.status).toBe(400);
  });
  it("PUT returns 404 if not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await faqPut(jsonReq("http://l/api", { question: "?" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes FAQ", async () => {
    const res = await faqDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await faqDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await faqPut(jsonReq("http://l/api", { question: "Q" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await faqDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Timeline [id] ─────────────────────────────────
import { PUT as tlPut, DELETE as tlDel } from "@/app/api/v1/admin/content/timeline/[id]/route";

describe("Admin Timeline [id]", () => {
  it("PUT updates event", async () => {
    const res = await tlPut(jsonReq("http://l/api", { title: "Ceremony" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await tlPut(jsonReq("http://l/api", { title: "Ceremony", description: "Desc", time: "3:00 PM", icon: "ring", sortOrder: 1, eventType: "ceremony" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 404 if not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await tlPut(jsonReq("http://l/api", { title: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes event", async () => {
    const res = await tlDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await tlDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await tlPut(jsonReq("http://l/api", { title: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await tlDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Guests [id] ───────────────────────────────────
import { PUT as guestPut, DELETE as guestDel } from "@/app/api/v1/admin/guests/[id]/route";

describe("Admin Guests [id]", () => {
  it("PUT updates guest", async () => {
    const res = await guestPut(jsonReq("http://l/api", { firstName: "John", lastName: "Doe" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await guestPut(jsonReq("http://l/api", {
      firstName: "John", lastName: "Doe", email: "j@d.com", phone: "555",
      group: "Family", rsvpStatus: "attending", plusOneAllowed: true,
      plusOneName: "Jane", plusOneAttending: true, mealPreference: "chicken",
      dietaryNeeds: "none", songRequest: "Song", childrenCount: 2,
      childrenNames: "Kid1, Kid2", tableNumber: "5", notes: "VIP"
    }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await guestPut(jsonReq("http://l/api", { firstName: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes guest", async () => {
    const res = await guestDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await guestDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await guestPut(jsonReq("http://l/api", { firstName: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await guestDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Guest Book [id] ───────────────────────────────
import { PUT as gbPut, DELETE as gbDel } from "@/app/api/v1/admin/guest-book/[id]/route";

describe("Admin Guest Book [id]", () => {
  it("PUT updates entry", async () => {
    const res = await gbPut(jsonReq("http://l/api", { name: "Guest", message: "Hi" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 400 for empty body", async () => {
    const res = await gbPut(jsonReq("http://l/api", {}), params("1"));
    expect(res.status).toBe(400);
  });
  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await gbPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes entry", async () => {
    const res = await gbDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await gbDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await gbPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await gbDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Guest Book [id]/approve ───────────────────────
import { POST as gbApprove } from "@/app/api/v1/admin/guest-book/[id]/approve/route";

describe("Admin Guest Book Approve", () => {
  it("POST approves entry", async () => {
    const req = new NextRequest("http://l/api", {
      method: "POST",
      body: JSON.stringify({ isVisible: true }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await gbApprove(req, params("1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.isVisible).toBe(true);
  });
  it("POST defaults isVisible to true", async () => {
    const req = new NextRequest("http://l/api", { method: "POST" });
    const res = await gbApprove(req, params("1"));
    expect(res.status).toBe(200);
  });
  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const req = new NextRequest("http://l/api", { method: "POST" });
    const res = await gbApprove(req, params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Meals [id] ────────────────────────────────────
import { PUT as mealPut, DELETE as mealDel } from "@/app/api/v1/admin/meals/[id]/route";

describe("Admin Meals [id]", () => {
  it("PUT updates meal", async () => {
    const res = await mealPut(jsonReq("http://l/api", { name: "Chicken", isVegetarian: false }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await mealPut(jsonReq("http://l/api", { name: "Salad", description: "Green", isVegetarian: true, isVegan: true, isGlutenFree: true }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 400 for empty body", async () => {
    const res = await mealPut(jsonReq("http://l/api", {}), params("1"));
    expect(res.status).toBe(400);
  });
  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await mealPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes meal", async () => {
    const res = await mealDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await mealDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await mealPut(jsonReq("http://l/api", { name: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await mealDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── DJ List [id] ──────────────────────────────────
import { PUT as djPut, DELETE as djDel } from "@/app/api/v1/admin/music/dj-list/[id]/route";

describe("Admin DJ List [id]", () => {
  it("PUT updates item", async () => {
    const res = await djPut(jsonReq("http://l/api", { songName: "Song", artist: "Artist" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT updates all optional fields", async () => {
    const res = await djPut(jsonReq("http://l/api", { songName: "Song", artist: "Artist", listType: "must-play", playTime: "dinner" }), params("1"));
    expect(res.status).toBe(200);
  });
  it("PUT returns 400 for empty body", async () => {
    const res = await djPut(jsonReq("http://l/api", {}), params("1"));
    expect(res.status).toBe(400);
  });
  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await djPut(jsonReq("http://l/api", { songName: "X" }), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE removes item", async () => {
    const res = await djDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await djDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await djPut(jsonReq("http://l/api", { songName: "X" }), params("1"));
    expect(res.status).toBe(500);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await djDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Music Requests [id] ───────────────────────────
import { DELETE as srDel } from "@/app/api/v1/admin/music/requests/[id]/route";

describe("Admin Music Requests [id]", () => {
  it("DELETE removes request", async () => {
    const res = await srDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });
  it("DELETE returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await srDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });
  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await srDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});
