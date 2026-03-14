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
  }),
}));

import { query, queryOne, execute, isUniqueViolation } from "@/lib/db";
const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockIsUnique = vi.mocked(isUniqueViolation);

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.mockResolvedValue([]);
  mockQueryOne.mockResolvedValue({ id: "1" });
  mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
  mockIsUnique.mockReturnValue(false);
});

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const tagParams = (tagId: string) => ({ params: Promise.resolve({ tagId }) });

function jsonReq(url: string, body: unknown, method = "PUT") {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Photos list ────────────────────────────────────
import { GET as photosGet } from "@/app/api/v1/admin/photos/route";

describe("Admin Photos GET", () => {
  it("returns photos with tags", async () => {
    mockQuery
      .mockResolvedValueOnce([{ id: "p1", approved: 1, storageKey: "k" }])
      .mockResolvedValueOnce([{ id: "t1", name: "Wedding", photoId: "p1" }]);
    const res = await photosGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data[0].tags).toBeDefined();
  });

  it("returns empty when no photos", async () => {
    const res = await photosGet();
    const data = await res.json();
    expect(data.data).toHaveLength(0);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));
    const res = await photosGet();
    expect(res.status).toBe(500);
  });
});

// ─── Photos [id] PUT/DELETE ─────────────────────────
import { PUT as photoPut, DELETE as photoDel } from "@/app/api/v1/admin/photos/[id]/route";

describe("Admin Photos [id]", () => {
  it("PUT updates caption", async () => {
    mockQueryOne.mockResolvedValue({ id: "1", approved: true });
    mockQuery.mockResolvedValue([]);
    const res = await photoPut(jsonReq("http://l", { caption: "Nice" }), params("1"));
    expect(res.status).toBe(200);
  });

  it("PUT updates all optional fields", async () => {
    mockQueryOne.mockResolvedValue({ id: "1", approved: true });
    mockQuery.mockResolvedValue([]);
    const res = await photoPut(jsonReq("http://l", { caption: "Nice", category: "ceremony", approved: true }), params("1"));
    expect(res.status).toBe(200);
  });

  it("PUT returns 400 for empty body", async () => {
    const res = await photoPut(jsonReq("http://l", {}), params("1"));
    expect(res.status).toBe(400);
  });

  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await photoPut(jsonReq("http://l", { caption: "X" }), params("1"));
    expect(res.status).toBe(404);
  });

  it("DELETE removes photo and storage", async () => {
    mockQueryOne.mockResolvedValue({ id: "1", storageKey: "key" });
    const res = await photoDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(200);
  });

  it("DELETE returns 404", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await photoDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(404);
  });

  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await photoPut(jsonReq("http://l", { caption: "X" }), params("1"));
    expect(res.status).toBe(500);
  });

  it("DELETE returns 500 on error", async () => {
    mockQueryOne.mockResolvedValue({ id: "1", storageKey: "key" });
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await photoDel(new Request("http://l"), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Photos [id]/approve ───────────────────────────
import { POST as photoApprove } from "@/app/api/v1/admin/photos/[id]/approve/route";

describe("Admin Photos Approve", () => {
  it("POST approves photo (default)", async () => {
    const res = await photoApprove(new NextRequest("http://l", { method: "POST" }), params("1"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.approved).toBe(true);
  });

  it("POST un-approves photo", async () => {
    const res = await photoApprove(
      new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ approved: false }),
        headers: { "Content-Type": "application/json" },
      }),
      params("1")
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.approved).toBe(false);
  });

  it("POST returns 404 when not found", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const res = await photoApprove(new NextRequest("http://l", { method: "POST" }), params("999"));
    expect(res.status).toBe(404);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await photoApprove(new NextRequest("http://l", { method: "POST" }), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Photos [id]/tags ──────────────────────────────
import { PUT as photoTagsPut } from "@/app/api/v1/admin/photos/[id]/tags/route";

describe("Admin Photos [id] Tags", () => {
  it("PUT sets tags", async () => {
    mockQueryOne.mockResolvedValue({ id: "1", approved: 1 });
    mockQuery.mockResolvedValue([{ id: "t1", name: "Wedding" }]);
    const res = await photoTagsPut(jsonReq("http://l", { tagIds: ["t1", "t2"] }), params("1"));
    expect(res.status).toBe(200);
  });

  it("PUT returns 400 for non-array tagIds", async () => {
    const res = await photoTagsPut(jsonReq("http://l", { tagIds: "bad" }), params("1"));
    expect(res.status).toBe(400);
  });

  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await photoTagsPut(jsonReq("http://l", { tagIds: ["t1"] }), params("1"));
    expect(res.status).toBe(500);
  });
});

// ─── Photo Tags (collection) ───────────────────────
import { GET as tagsGet, POST as tagsPost } from "@/app/api/v1/admin/photos/tags/route";

describe("Admin Photo Tags", () => {
  it("GET returns tags with counts", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Wedding", type: "event", photoCount: 3 }]);
    const res = await tagsGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data[0]._count.photos).toBe(3);
  });

  it("POST creates tag", async () => {
    mockQueryOne.mockResolvedValue({ id: "test-id", name: "Ceremony" });
    const res = await tagsPost(jsonReq("http://l", { name: "Ceremony", type: "event" }, "POST"));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 for missing name", async () => {
    const res = await tagsPost(jsonReq("http://l", { name: "" }, "POST"));
    expect(res.status).toBe(400);
  });

  it("POST returns 409 for duplicate", async () => {
    mockIsUnique.mockReturnValue(true);
    mockExecute.mockRejectedValueOnce(new Error("UNIQUE constraint"));
    const res = await tagsPost(jsonReq("http://l", { name: "Dup" }, "POST"));
    expect(res.status).toBe(409);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await tagsGet();
    expect(res.status).toBe(500);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await tagsPost(jsonReq("http://l", { name: "New" }, "POST"));
    expect(res.status).toBe(500);
  });
});

// ─── Photo Tags [tagId] ───────────────────────────
import { PUT as tagPut, DELETE as tagDel } from "@/app/api/v1/admin/photos/tags/[tagId]/route";

describe("Admin Photo Tags [tagId]", () => {
  it("PUT updates tag", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await tagPut(req, tagParams("1"));
    expect(res.status).toBe(200);
  });

  it("PUT returns 400 for empty update", async () => {
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await tagPut(req, tagParams("1"));
    expect(res.status).toBe(400);
  });

  it("PUT returns 404", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined });
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await tagPut(req, tagParams("1"));
    expect(res.status).toBe(404);
  });

  it("DELETE removes tag", async () => {
    const res = await tagDel(new Request("http://l"), tagParams("1"));
    expect(res.status).toBe(200);
  });

  it("DELETE returns 404", async () => {
    mockExecute
      .mockResolvedValueOnce({ rowsAffected: 1, lastInsertRowid: undefined }) // join table delete
      .mockResolvedValueOnce({ rowsAffected: 0, lastInsertRowid: undefined }); // tag delete
    const res = await tagDel(new Request("http://l"), tagParams("1"));
    expect(res.status).toBe(404);
  });

  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const req = new NextRequest("http://l", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await tagPut(req, tagParams("1"));
    expect(res.status).toBe(500);
  });

  it("DELETE returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await tagDel(new Request("http://l"), tagParams("1"));
    expect(res.status).toBe(500);
  });
});

// ─── DJ List (collection) ──────────────────────────
import { GET as djListGet, POST as djListPost } from "@/app/api/v1/admin/music/dj-list/route";

describe("Admin DJ List", () => {
  it("GET returns items", async () => {
    mockQuery.mockResolvedValue([{ id: "1", songName: "Test" }]);
    const res = await djListGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("POST creates item", async () => {
    mockQueryOne.mockResolvedValue({ id: "test-id", songName: "Song" });
    const res = await djListPost(jsonReq("http://l", { songName: "Song", artist: "Artist" }, "POST"));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 for empty song name", async () => {
    const res = await djListPost(jsonReq("http://l", { songName: "" }, "POST"));
    expect(res.status).toBe(400);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await djListGet();
    expect(res.status).toBe(500);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await djListPost(jsonReq("http://l", { songName: "X", artist: "Y" }, "POST"));
    expect(res.status).toBe(500);
  });
});

// ─── Music Requests (admin list) ───────────────────
import { GET as musicReqGet } from "@/app/api/v1/admin/music/requests/route";

describe("Admin Music Requests GET", () => {
  it("returns all requests", async () => {
    mockQuery.mockResolvedValue([{ id: "1", songName: "Song" }]);
    const res = await musicReqGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db"));
    const res = await musicReqGet();
    expect(res.status).toBe(500);
  });
});

// ─── Settings ──────────────────────────────────────
import { GET as settingsGet, PUT as settingsPut } from "@/app/api/v1/admin/settings/route";

describe("Admin Settings", () => {
  it("GET returns settings with masked password", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", sitePassword: "secret", coupleName: "J&A" });
    const res = await settingsGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.sitePassword).toBe("••••••••");
  });

  it("GET returns null when no settings", async () => {
    mockQueryOne.mockResolvedValue(null);
    const res = await settingsGet();
    const data = await res.json();
    expect(data.data).toBeNull();
  });

  it("PUT updates settings", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", coupleName: "J&A" });
    const res = await settingsPut(jsonReq("http://l", { coupleName: "J & A" }, "PUT"));
    expect(res.status).toBe(200);
  });

  it("PUT does not overwrite password with masked value", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton" });
    await settingsPut(jsonReq("http://l", { sitePassword: "••••••••" }, "PUT"));
    // Check that execute was called but sitePassword = ? (exact column) was NOT in the SQL
    const callArgs = mockExecute.mock.calls[0];
    const sql = callArgs[0] as string;
    // sitePasswordEnabled is fine; we only care that sitePassword (exact) column is absent
    expect(sql).not.toMatch(/sitePassword\s*=/);
  });

  it("PUT updates real password", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton" });
    await settingsPut(jsonReq("http://l", { sitePassword: "newpassword" }, "PUT"));
    const callArgs = mockExecute.mock.calls[0];
    const sql = callArgs[0] as string;
    expect(sql).toContain("sitePassword");
  });

  it("GET returns 500 on error", async () => {
    mockQueryOne.mockRejectedValueOnce(new Error("db"));
    const res = await settingsGet();
    expect(res.status).toBe(500);
  });

  it("PUT returns 500 on error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("db"));
    const res = await settingsPut(jsonReq("http://l", { coupleName: "X" }, "PUT"));
    expect(res.status).toBe(500);
  });
});
