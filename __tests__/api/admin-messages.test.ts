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

import { PUT, DELETE } from "@/app/api/v1/admin/messages/[id]/route";
import { POST as MarkRead } from "@/app/api/v1/admin/messages/[id]/read/route";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("Admin Messages [id]", () => {
  describe("PUT", () => {
    it("returns 400 if isRead not provided", async () => {
      const req = new NextRequest("http://l", {
        method: "PUT",
        body: JSON.stringify({}),
      });
      const res = await PUT(req, params("m1"));
      expect(res.status).toBe(400);
    });

    it("returns 404 when message not found", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 0, rows: [], columns: [], lastInsertRowid: undefined });
      const req = new NextRequest("http://l", {
        method: "PUT",
        body: JSON.stringify({ isRead: true }),
      });
      const res = await PUT(req, params("m1"));
      expect(res.status).toBe(404);
    });

    it("updates isRead successfully", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
      mockQueryOne.mockResolvedValue({ id: "m1", isRead: 1 } as never);
      const req = new NextRequest("http://l", {
        method: "PUT",
        body: JSON.stringify({ isRead: true }),
      });
      const res = await PUT(req, params("m1"));
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("m1");
    });

    it("handles server error", async () => {
      mockExecute.mockRejectedValue(new Error("db fail"));
      const req = new NextRequest("http://l", {
        method: "PUT",
        body: JSON.stringify({ isRead: false }),
      });
      const res = await PUT(req, params("m1"));
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE", () => {
    it("returns 404 when message not found", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 0, rows: [], columns: [], lastInsertRowid: undefined });
      const req = new Request("http://l", { method: "DELETE" });
      const res = await DELETE(req, params("m1"));
      expect(res.status).toBe(404);
    });

    it("deletes message successfully", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
      const req = new Request("http://l", { method: "DELETE" });
      const res = await DELETE(req, params("m1"));
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
    });

    it("handles server error", async () => {
      mockExecute.mockRejectedValue(new Error("db fail"));
      const req = new Request("http://l", { method: "DELETE" });
      const res = await DELETE(req, params("m1"));
      expect(res.status).toBe(500);
    });
  });

  describe("Mark Read (POST)", () => {
    it("marks message as read", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });
      const req = new Request("http://l", { method: "POST" });
      const res = await MarkRead(req, params("m1"));
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.isRead).toBe(true);
    });

    it("handles error", async () => {
      mockExecute.mockRejectedValue(new Error("db fail"));
      const req = new Request("http://l", { method: "POST" });
      const res = await MarkRead(req, params("m1"));
      expect(res.status).toBe(500);
    });
  });
});
