import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── music/search ──────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { GET as musicSearchGet } from "@/app/api/v1/music/search/route";

describe("Music Search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array for short query", async () => {
    const req = new NextRequest("http://l/api/v1/music/search?q=a");
    const res = await musicSearchGet(req);
    const data = await res.json();
    expect(data.data).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns empty array for missing query", async () => {
    const req = new NextRequest("http://l/api/v1/music/search");
    const res = await musicSearchGet(req);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("returns mapped results from iTunes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [
          {
            trackId: 1,
            trackName: "Song",
            artistName: "Artist",
            collectionName: "Album",
            trackTimeMillis: 200000,
            artworkUrl100: "http://img",
            previewUrl: "http://preview",
          },
        ],
      }),
    });

    const req = new NextRequest("http://l/api/v1/music/search?q=song");
    const res = await musicSearchGet(req);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].songName).toBe("Song");
    expect(data.data[0].artist).toBe("Artist");
  });

  it("returns 502 when iTunes API fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const req = new NextRequest("http://l/api/v1/music/search?q=song");
    const res = await musicSearchGet(req);
    expect(res.status).toBe(502);
  });

  it("returns 500 when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const req = new NextRequest("http://l/api/v1/music/search?q=song");
    const res = await musicSearchGet(req);
    expect(res.status).toBe(500);
  });
});
