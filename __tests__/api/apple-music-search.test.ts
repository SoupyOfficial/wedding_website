import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Apple Music Search (iTunes proxy) ─────────────
vi.mock("@/lib/api", () => ({
  successResponse: (data: unknown) =>
    Response.json({ success: true, data }, { status: 200 }),
  errorResponse: (msg: string, status = 500) =>
    Response.json({ success: false, error: msg }, { status }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { GET as SearchGET } from "@/app/api/v1/admin/music/apple-music/search/route";

beforeEach(() => vi.clearAllMocks());

describe("Apple Music Search (iTunes proxy)", () => {
  it("returns empty array for short query", async () => {
    const req = new NextRequest("http://l/api?q=a");
    const res = await SearchGET(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("returns empty array for missing query", async () => {
    const req = new NextRequest("http://l/api");
    const res = await SearchGET(req);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("returns mapped results from iTunes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              trackId: 123,
              trackName: "Song A",
              artistName: "Artist B",
              collectionName: "Album C",
              trackTimeMillis: 240000,
              artworkUrl100: "http://art.jpg",
              previewUrl: "http://preview.m4a",
            },
          ],
        }),
    });
    const req = new NextRequest("http://l/api?q=songA&limit=5");
    const res = await SearchGET(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].songName).toBe("Song A");
    expect(data.data[0].artist).toBe("Artist B");
  });

  it("returns 502 when iTunes API fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const req = new NextRequest("http://l/api?q=hello");
    const res = await SearchGET(req);
    expect(res.status).toBe(502);
  });

  it("returns 500 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));
    const req = new NextRequest("http://l/api?q=hello");
    const res = await SearchGET(req);
    expect(res.status).toBe(500);
  });
});
