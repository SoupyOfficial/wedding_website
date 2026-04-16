import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock jsonwebtoken so we don't need real keys
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "mock-jwt-token") },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import {
  parsePlaylistUrl,
  isAppleMusicConfigured,
  getConfig,
  getAppleMusicToken,
  fetchPlaylist,
} from "@/lib/apple-music";
import type { AppleMusicConfig } from "@/lib/apple-music";

const validConfig: AppleMusicConfig = {
  teamId: "TEAM123",
  keyId: "KEY456",
  privateKey: "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----",
};

describe("parsePlaylistUrl", () => {
  it("parses standard playlist URL with name segment", () => {
    const url =
      "https://music.apple.com/us/playlist/wedding-playlist/pl.abc123";
    const result = parsePlaylistUrl(url);
    expect(result).toEqual({ storefront: "us", playlistId: "pl.abc123" });
  });

  it("parses URL without name segment", () => {
    const url = "https://music.apple.com/gb/playlist/pl.xyz789";
    const result = parsePlaylistUrl(url);
    expect(result).toEqual({ storefront: "gb", playlistId: "pl.xyz789" });
  });

  it("returns null for non-Apple Music URL", () => {
    expect(parsePlaylistUrl("https://spotify.com/playlist/123")).toBeNull();
  });

  it("returns null for Apple Music URL without playlist ID", () => {
    expect(
      parsePlaylistUrl("https://music.apple.com/us/album/some-album/12345")
    ).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parsePlaylistUrl("not-a-url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePlaylistUrl("")).toBeNull();
  });
});

describe("isAppleMusicConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns true when all env vars are set", () => {
    process.env.APPLE_MUSIC_TEAM_ID = "TEAM123";
    process.env.APPLE_MUSIC_KEY_ID = "KEY456";
    process.env.APPLE_MUSIC_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----";
    expect(isAppleMusicConfigured()).toBe(true);
  });

  it("returns false when TEAM_ID is missing", () => {
    delete process.env.APPLE_MUSIC_TEAM_ID;
    process.env.APPLE_MUSIC_KEY_ID = "KEY456";
    process.env.APPLE_MUSIC_PRIVATE_KEY = "key";
    expect(isAppleMusicConfigured()).toBe(false);
  });

  it("returns false when KEY_ID is missing", () => {
    process.env.APPLE_MUSIC_TEAM_ID = "TEAM123";
    delete process.env.APPLE_MUSIC_KEY_ID;
    process.env.APPLE_MUSIC_PRIVATE_KEY = "key";
    expect(isAppleMusicConfigured()).toBe(false);
  });

  it("returns false when PRIVATE_KEY is missing", () => {
    process.env.APPLE_MUSIC_TEAM_ID = "TEAM123";
    process.env.APPLE_MUSIC_KEY_ID = "KEY456";
    delete process.env.APPLE_MUSIC_PRIVATE_KEY;
    expect(isAppleMusicConfigured()).toBe(false);
  });

  it("returns false when none are set", () => {
    delete process.env.APPLE_MUSIC_TEAM_ID;
    delete process.env.APPLE_MUSIC_KEY_ID;
    delete process.env.APPLE_MUSIC_PRIVATE_KEY;
    expect(isAppleMusicConfigured()).toBe(false);
  });
});

describe("getConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when credentials not configured", () => {
    delete process.env.APPLE_MUSIC_TEAM_ID;
    delete process.env.APPLE_MUSIC_KEY_ID;
    delete process.env.APPLE_MUSIC_PRIVATE_KEY;
    expect(() => getConfig()).toThrow("Apple Music credentials not configured");
  });

  it("returns typed config when all env vars set", () => {
    process.env.APPLE_MUSIC_TEAM_ID = "TEAM123";
    process.env.APPLE_MUSIC_KEY_ID = "KEY456";
    process.env.APPLE_MUSIC_PRIVATE_KEY = "test-key";
    const config = getConfig();
    expect(config).toEqual({ teamId: "TEAM123", keyId: "KEY456", privateKey: "test-key" });
  });
});

describe("getAppleMusicToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns signed token for valid config", () => {
    const token = getAppleMusicToken(validConfig);
    expect(token).toBe("mock-jwt-token");
  });
});

describe("fetchPlaylist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches playlist tracks successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "pl.123",
              attributes: { name: "My Playlist" },
              relationships: {
                tracks: {
                  data: [
                    {
                      id: "t1",
                      attributes: {
                        name: "Song 1",
                        artistName: "Artist 1",
                        albumName: "Album 1",
                        durationInMillis: 200000,
                        artwork: { url: "http://art/{w}x{h}.jpg", width: 100, height: 100 },
                        previews: [{ url: "http://preview.m4a" }],
                      },
                    },
                  ],
                },
              },
            },
          ],
        }),
    });
    const result = await fetchPlaylist(validConfig, "us", "pl.123");
    expect(result.name).toBe("My Playlist");
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].songName).toBe("Song 1");
    expect(result.tracks[0].artist).toBe("Artist 1");
  });

  it("throws when API returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve("Forbidden"),
    });
    await expect(fetchPlaylist(validConfig, "us", "pl.123")).rejects.toThrow("Apple Music API error");
  });

  it("throws when playlist not found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    await expect(fetchPlaylist(validConfig, "us", "pl.999")).rejects.toThrow("Playlist not found");
  });

  it("handles pagination for large playlists", async () => {
    // First request returns tracks with a next page
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "pl.123",
                attributes: { name: "Big Playlist" },
                relationships: {
                  tracks: {
                    data: [
                      {
                        id: "t1",
                        attributes: {
                          name: "Song 1",
                          artistName: "Artist",
                          albumName: "Album",
                          durationInMillis: 180000,
                        },
                      },
                    ],
                    next: "/v1/catalog/us/playlists/pl.123/tracks?offset=100",
                  },
                },
              },
            ],
          }),
      })
      // Second request (pagination)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "t2",
                attributes: {
                  name: "Song 2",
                  artistName: "Artist 2",
                  albumName: "Album 2",
                  durationInMillis: 200000,
                },
              },
            ],
            // No more pages
          }),
      });
    const result = await fetchPlaylist(validConfig, "us", "pl.123");
    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[1].songName).toBe("Song 2");
  });
});
