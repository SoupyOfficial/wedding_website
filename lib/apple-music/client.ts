import type { AppleMusicConfig } from "./config";
import { getAppleMusicToken } from "./auth";
import { formatTrack } from "./formatter";
import type { AppleMusicTrack, PlaylistInfo } from "./formatter";

const APPLE_MUSIC_API = "https://api.music.apple.com/v1";

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

/**
 * Extract playlist ID and storefront from an Apple Music URL.
 */
export function parsePlaylistUrl(url: string): {
  storefront: string;
  playlistId: string;
} | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("music.apple.com")) return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const storefront = parts[0];
    const playlistId = parts.find((p) => p.startsWith("pl."));

    if (!storefront || !playlistId) return null;
    return { storefront, playlistId };
  } catch {
    return null;
  }
}

/**
 * Fetch all tracks from an Apple Music playlist (handles pagination).
 */
export async function fetchPlaylist(
  config: AppleMusicConfig,
  storefront: string,
  playlistId: string
): Promise<PlaylistInfo> {
  const token = getAppleMusicToken(config);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

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

  const allTracks = [];

  let tracksData = playlist.relationships?.tracks;
  if (tracksData?.data) {
    for (const track of tracksData.data) {
      allTracks.push(formatTrack(track));
    }
  }

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
