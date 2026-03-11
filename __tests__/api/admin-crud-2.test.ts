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

// Admin registry
import { GET as registryGet, POST as registryPost } from "@/app/api/v1/admin/registry/route";
// Admin wedding party
import { GET as wpGet, POST as wpPost } from "@/app/api/v1/admin/wedding-party/route";
// Admin content FAQs
import { GET as faqGet, POST as faqPost } from "@/app/api/v1/admin/content/faqs/route";
// Admin content timeline
import { GET as timelineGet, POST as timelinePost } from "@/app/api/v1/admin/content/timeline/route";

describe("Admin Registry", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/registry", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("GET returns all registry items", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Target" }]);
    const res = await registryGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("db fail"));
    const res = await registryGet();
    expect(res.status).toBe(500);
  });

  it("POST creates a registry item", async () => {
    const res = await registryPost(makeReq({ name: "Target", url: "https://target.com" }));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 when name missing", async () => {
    const res = await registryPost(makeReq({ name: "", url: "https://target.com" }));
    expect(res.status).toBe(400);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const res = await registryPost(makeReq({ name: "Target", url: "https://target.com" }));
    expect(res.status).toBe(500);
  });
});

describe("Admin Wedding Party", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/wedding-party", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("GET returns all members", async () => {
    mockQuery.mockResolvedValue([{ id: "1", name: "Best Man" }]);
    const res = await wpGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("db fail"));
    const res = await wpGet();
    expect(res.status).toBe(500);
  });

  it("POST creates a member", async () => {
    const res = await wpPost(makeReq({ name: "John", role: "Best Man", side: "groom" }));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 when name missing", async () => {
    const res = await wpPost(makeReq({ name: "", role: "Best Man", side: "groom" }));
    expect(res.status).toBe(400);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const res = await wpPost(makeReq({ name: "John", role: "Best Man", side: "groom" }));
    expect(res.status).toBe(500);
  });
});

describe("Admin FAQs", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/content/faqs", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("GET returns all FAQs", async () => {
    mockQuery.mockResolvedValue([{ id: "1", question: "When?" }]);
    const res = await faqGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("db fail"));
    const res = await faqGet();
    expect(res.status).toBe(500);
  });

  it("POST creates a FAQ", async () => {
    const res = await faqPost(makeReq({ question: "When?", answer: "October" }));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 when question missing", async () => {
    const res = await faqPost(makeReq({ question: "", answer: "Oct" }));
    expect(res.status).toBe(400);
  });

  it("POST returns 400 when answer missing", async () => {
    const res = await faqPost(makeReq({ question: "When?", answer: "" }));
    expect(res.status).toBe(400);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const res = await faqPost(makeReq({ question: "When?", answer: "October" }));
    expect(res.status).toBe(500);
  });
});

describe("Admin Timeline", () => {
  function makeReq(body: unknown) {
    return new NextRequest("http://localhost:3000/api/v1/admin/content/timeline", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("GET returns all timeline events", async () => {
    mockQuery.mockResolvedValue([{ id: "1", title: "Ceremony" }]);
    const res = await timelineGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("GET returns 500 on error", async () => {
    mockQuery.mockRejectedValue(new Error("db fail"));
    const res = await timelineGet();
    expect(res.status).toBe(500);
  });

  it("POST creates a timeline event", async () => {
    const res = await timelinePost(makeReq({ title: "Ceremony" }));
    expect(res.status).toBe(201);
  });

  it("POST returns 400 when title missing", async () => {
    const res = await timelinePost(makeReq({ title: "" }));
    expect(res.status).toBe(400);
  });

  it("POST returns 500 on error", async () => {
    mockExecute.mockRejectedValue(new Error("db fail"));
    const res = await timelinePost(makeReq({ title: "Ceremony" }));
    expect(res.status).toBe(500);
  });
});
