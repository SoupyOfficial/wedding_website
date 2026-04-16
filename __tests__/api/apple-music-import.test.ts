import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  execute: vi.fn(),
  generateId: vi.fn(() => "gen-id"),
}));

vi.mock("@/lib/apple-music", () => ({
  isAppleMusicConfigured: vi.fn(),
  getConfig: vi.fn(() => ({ teamId: "T", keyId: "K", privateKey: "PK" })),
  parsePlaylistUrl: vi.fn(),
  fetchPlaylist: vi.fn(),
}));

import { query, execute } from "@/lib/db";
import {
  isAppleMusicConfigured,
  parsePlaylistUrl,
  fetchPlaylist,
} from "@/lib/apple-music";

const mockQuery = vi.mocked(query);
const mockExecute = vi.mocked(execute);
const mockIsConfigured = vi.mocked(isAppleMusicConfigured);
const mockParseUrl = vi.mocked(parsePlaylistUrl);
const mockFetchPlaylist = vi.mocked(fetchPlaylist);

import { GET, POST } from "@/app/api/v1/admin/music/apple-music/import/route";

beforeEach(() => vi.clearAllMocks());

describe("Apple Music Import", () => {
  describe("GET (check config)", () => {
    it("returns configured status when check=true", async () => {
      mockIsConfigured.mockReturnValue(true);
      const req = new NextRequest("http://l/api?check=true");
      const res = await GET(req);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.configured).toBe(true);
    });

    it("returns false when not configured", async () => {
      mockIsConfigured.mockReturnValue(false);
      const req = new NextRequest("http://l/api?check=true");
      const res = await GET(req);
      const data = await res.json();
      expect(data.data.configured).toBe(false);
    });

    it("returns 400 when check param missing", async () => {
      const req = new NextRequest("http://l/api");
      const res = await GET(req);
      expect(res.status).toBe(400);
    });
  });

  describe("POST (import playlist)", () => {
    it("returns 400 when not configured", async () => {
      mockIsConfigured.mockReturnValue(false);
      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ url: "https://music.apple.com/us/playlist/test/pl.123" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("not configured");
    });

    it("returns 400 when url is empty", async () => {
      mockIsConfigured.mockReturnValue(true);
      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ url: "" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid playlist URL", async () => {
      mockIsConfigured.mockReturnValue(true);
      mockParseUrl.mockReturnValue(null);
      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ url: "https://example.com/not-apple" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid");
    });

    it("returns 400 for empty playlist", async () => {
      mockIsConfigured.mockReturnValue(true);
      mockParseUrl.mockReturnValue({ storefront: "us", playlistId: "pl.123" });
      mockFetchPlaylist.mockResolvedValue({ name: "Empty", tracks: [] });
      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ url: "https://music.apple.com/us/playlist/x/pl.123" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("imports tracks successfully skipping duplicates", async () => {
      mockIsConfigured.mockReturnValue(true);
      mockParseUrl.mockReturnValue({ storefront: "us", playlistId: "pl.123" });
      mockFetchPlaylist.mockResolvedValue({
        name: "My Playlist",
        tracks: [
          { songName: "Song A", artist: "Artist A" },
          { songName: "Song B", artist: "Artist B" },
          { songName: "Existing", artist: "Dup" },
        ],
      });
      // Return existing songs
      mockQuery.mockResolvedValue([
        { songName: "Existing", artist: "Dup" },
      ] as never);
      mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });

      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({
          url: "https://music.apple.com/us/playlist/x/pl.123",
          listType: "must-play",
          skipDuplicates: true,
        }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.addedCount).toBe(2);
      expect(data.data.skippedCount).toBe(1);
      expect(data.data.playlistName).toBe("My Playlist");
    });

    it("imports all tracks when skipDuplicates is false", async () => {
      mockIsConfigured.mockReturnValue(true);
      mockParseUrl.mockReturnValue({ storefront: "us", playlistId: "pl.456" });
      mockFetchPlaylist.mockResolvedValue({
        name: "Party Mix",
        tracks: [
          { songName: "Song A", artist: "Artist A" },
          { songName: "Song B", artist: "Artist B" },
        ],
      });
      mockExecute.mockResolvedValue({ rowsAffected: 1, rows: [], columns: [], lastInsertRowid: undefined });

      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({
          url: "https://music.apple.com/us/playlist/x/pl.456",
          skipDuplicates: false,
        }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.addedCount).toBe(2);
      expect(data.data.skippedCount).toBe(0);
    });

    it("handles fetch error", async () => {
      mockIsConfigured.mockReturnValue(true);
      mockParseUrl.mockReturnValue({ storefront: "us", playlistId: "pl.123" });
      mockFetchPlaylist.mockRejectedValue(new Error("Apple Music unavailable"));

      const req = new NextRequest("http://l", {
        method: "POST",
        body: JSON.stringify({ url: "https://music.apple.com/us/playlist/x/pl.123" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain("Apple Music unavailable");
    });
  });
});
