import jwt from "jsonwebtoken";

// ─── Apple Music Developer Token ─────────────────────────────
// Required env vars:
//   APPLE_MUSIC_TEAM_ID     – Your Apple Developer Team ID
//   APPLE_MUSIC_KEY_ID      – MusicKit key identifier
//   APPLE_MUSIC_PRIVATE_KEY – MusicKit private key (.p8 contents, with \n for newlines)

let cachedToken: { token: string; expiresAt: number } | null = null;

export function getAppleMusicToken(): string {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!teamId || !keyId || !privateKey) {
    throw new Error(
      "Apple Music credentials not configured. Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY."
    );
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  // Token valid for 6 months (maximum allowed)
  const expiresInSeconds = 15777000; // ~6 months
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign({}, privateKey.replace(/\\n/g, "\n"), {
    algorithm: "ES256",
    expiresIn: expiresInSeconds,
    issuer: teamId,
    header: {
      alg: "ES256",
      kid: keyId,
    },
  });

  cachedToken = {
    token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return token;
}

// ─── Apple Music API Helpers ─────────────────────────────────

const APPLE_MUSIC_API = "https://api.music.apple.com/v1";

interface AppleMusicTrack {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    previews?: Array<{ url: string }>;
  };
}

interface AppleMusicPlaylistResponse {
  data: Array<{
    id: string;
    attributes: {
      name: string;
      description?: { standard: string };
      curatorName?: string;
    };
    relationships?: {
      tracks?: {
        data: AppleMusicTrack[];
        next?: string;
      };
    };
  }>;
}

export interface PlaylistTrack {
  songName: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl?: string;
  previewUrl?: string;
}

export interface PlaylistInfo {
  name: string;
  description?: string;
  curatorName?: string;
  tracks: PlaylistTrack[];
}

/**
 * Extract playlist ID and storefront from an Apple Music URL.
 * Supports formats like:
 *   https://music.apple.com/us/playlist/my-playlist/pl.xxxx
 *   https://music.apple.com/us/playlist/pl.xxxx
 */
export function parsePlaylistUrl(url: string): {
  storefront: string;
  playlistId: string;
} | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("music.apple.com")) return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    // Expected: [storefront, "playlist", name?, pl.xxxx] or [storefront, "playlist", pl.xxxx]
    const sfIndex = 0;
    const storefront = parts[sfIndex];

    // Find the playlist ID (starts with "pl.")
    const playlistId = parts.find((p) => p.startsWith("pl."));

    if (!storefront || !playlistId) return null;
    return { storefront, playlistId };
  } catch {
    return null;
  }
}

/**
 * Fetch all tracks from an Apple Music playlist.
 * Handles pagination to get the complete track list.
 */
export async function fetchPlaylist(
  storefront: string,
  playlistId: string
): Promise<PlaylistInfo> {
  const token = getAppleMusicToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch playlist with tracks included
  const url = `${APPLE_MUSIC_API}/catalog/${storefront}/playlists/${playlistId}?include=tracks&l=en-US`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apple Music API error (${res.status}): ${text}`);
  }

  const data: AppleMusicPlaylistResponse = await res.json();
  const playlist = data.data[0];

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  const allTracks: PlaylistTrack[] = [];

  // Process initial batch of tracks
  let tracksData = playlist.relationships?.tracks;
  if (tracksData?.data) {
    for (const track of tracksData.data) {
      allTracks.push(formatTrack(track));
    }
  }

  // Handle pagination — Apple Music returns tracks in batches of ~100
  let nextUrl = tracksData?.next;
  while (nextUrl) {
    const pageRes = await fetch(`${APPLE_MUSIC_API}${nextUrl}`, { headers });
    if (!pageRes.ok) break;

    const pageData = await pageRes.json();
    if (pageData.data) {
      for (const track of pageData.data) {
        allTracks.push(formatTrack(track));
      }
    }
    nextUrl = pageData.next || null;
  }

  return {
    name: playlist.attributes.name,
    description: playlist.attributes.description?.standard,
    curatorName: playlist.attributes.curatorName,
    tracks: allTracks,
  };
}

function formatTrack(track: AppleMusicTrack): PlaylistTrack {
  const artworkUrl = track.attributes.artwork?.url
    ?.replace("{w}", "100")
    .replace("{h}", "100");

  return {
    songName: track.attributes.name,
    artist: track.attributes.artistName,
    album: track.attributes.albumName,
    durationMs: track.attributes.durationInMillis,
    artworkUrl,
    previewUrl: track.attributes.previews?.[0]?.url,
  };
}

/**
 * Check if Apple Music credentials are configured.
 */
export function isAppleMusicConfigured(): boolean {
  return !!(
    process.env.APPLE_MUSIC_TEAM_ID &&
    process.env.APPLE_MUSIC_KEY_ID &&
    process.env.APPLE_MUSIC_PRIVATE_KEY
  );
}
