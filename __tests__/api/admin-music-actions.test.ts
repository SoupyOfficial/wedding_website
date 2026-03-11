import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  execute: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

import { queryOne, execute } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);

// ─── Music Request Approve ─────────────────────────
import { POST as songApprove } from "@/app/api/v1/admin/music/requests/[id]/approve/route";

// ─── Music Request Visibility ──────────────────────
import { POST as songVisibility } from "@/app/api/v1/admin/music/requests/[id]/visibility/route";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("Music Request Approve", () => {
  it("approves with default (no body)", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    const req = new NextRequest("http://l", { method: "POST" });
    const res = await songApprove(req, params("sr1"));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.approved).toBe(true);
  });

  it("approves with explicit body", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    const req = new NextRequest("http://l", {
      method: "POST",
      body: JSON.stringify({ approved: false }),
    });
    const res = await songApprove(req, params("sr1"));
    const data = await res.json();
    expect(data.data.approved).toBe(false);
  });

  it("handles error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const req = new NextRequest("http://l", { method: "POST" });
    const res = await songApprove(req, params("sr1"));
    expect(res.status).toBe(500);
  });
});

describe("Music Request Visibility", () => {
  it("toggles visibility with default (no body)", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    mockQueryOne.mockResolvedValue({ id: "sr1", isVisible: true } as never);
    const req = new NextRequest("http://l", { method: "POST" });
    const res = await songVisibility(req, params("sr1"));
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("toggles visibility with explicit body", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    mockQueryOne.mockResolvedValue({ id: "sr1", isVisible: false } as never);
    const req = new NextRequest("http://l", {
      method: "POST",
      body: JSON.stringify({ isVisible: false }),
    });
    const res = await songVisibility(req, params("sr1"));
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("defaults to visible when body isVisible is not boolean", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    mockQueryOne.mockResolvedValue({ id: "sr1", isVisible: true } as never);
    const req = new NextRequest("http://l", {
      method: "POST",
      body: JSON.stringify({ isVisible: "yes" }),
    });
    const res = await songVisibility(req, params("sr1"));
    expect(res.status).toBe(200);
  });

  it("handles null updated record", async () => {
    mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
    mockQueryOne.mockResolvedValue(null);
    const req = new NextRequest("http://l", { method: "POST" });
    const res = await songVisibility(req, params("sr1"));
    expect(res.status).toBe(200);
  });

  it("handles error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const req = new NextRequest("http://l", { method: "POST" });
    const res = await songVisibility(req, params("sr1"));
    expect(res.status).toBe(500);
  });
});
