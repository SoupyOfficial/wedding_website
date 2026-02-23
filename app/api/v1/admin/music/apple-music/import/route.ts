import { NextRequest } from "next/server";
import { query, execute, generateId } from "@/lib/db";
import {
  isAppleMusicConfigured,
  parsePlaylistUrl,
  fetchPlaylist,
} from "@/lib/apple-music";
import { successResponse, errorResponse } from "@/lib/api";

/**
 * GET /api/v1/admin/music/apple-music/import?check=true
 * Check if Apple Music API credentials are configured.
 */
export async function GET(req: NextRequest) {
  const check = req.nextUrl.searchParams.get("check");
  if (check) {
    return successResponse({ configured: isAppleMusicConfigured() });
  }
  return errorResponse("Invalid request", 400);
}

/**
 * POST /api/v1/admin/music/apple-music/import
 * Import tracks from an Apple Music playlist URL into the DJ list.
 *
 * Body: { url: string, listType?: "must-play" | "do-not-play", skipDuplicates?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAppleMusicConfigured()) {
      return errorResponse(
        "Apple Music API not configured. Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY environment variables.",
        400
      );
    }

    const body = await req.json();
    const { url, listType = "must-play", playTime = "", skipDuplicates = true } = body;

    if (!url?.trim()) {
      return errorResponse("Playlist URL is required.", 400);
    }

    // Parse the Apple Music playlist URL
    const parsed = parsePlaylistUrl(url.trim());
    if (!parsed) {
      return errorResponse(
        "Invalid Apple Music playlist URL. Expected format: https://music.apple.com/us/playlist/name/pl.xxxx",
        400
      );
    }

    // Fetch playlist from Apple Music API
    const playlist = await fetchPlaylist(parsed.storefront, parsed.playlistId);

    if (playlist.tracks.length === 0) {
      return errorResponse("Playlist is empty.", 400);
    }

    // Get existing DJ list items to detect duplicates
    let existingSongs = new Set<string>();
    if (skipDuplicates) {
      const existing = await query<{ songName: string; artist: string }>("SELECT songName, artist FROM DJList");
      existingSongs = new Set(
        existing.map(
          (s) => `${s.songName.toLowerCase()}::${s.artist.toLowerCase()}`
        )
      );
    }

    // Filter out duplicates and prepare data
    const tracksToAdd = playlist.tracks.filter((track) => {
      if (!skipDuplicates) return true;
      const key = `${track.songName.toLowerCase()}::${track.artist.toLowerCase()}`;
      return !existingSongs.has(key);
    });

    // Bulk create DJ list items
    let addedCount = 0;
    if (tracksToAdd.length > 0) {
      for (const track of tracksToAdd) {
        const id = generateId();
        await execute(
          "INSERT INTO DJList (id, songName, artist, listType, playTime) VALUES (?, ?, ?, ?, ?)",
          [id, track.songName, track.artist, listType, playTime || ""]
        );
        addedCount++;
      }
    }

    const skippedCount = playlist.tracks.length - addedCount;

    return successResponse({
      playlistName: playlist.name,
      totalTracks: playlist.tracks.length,
      addedCount,
      skippedCount,
      tracks: tracksToAdd.map((t) => ({
        songName: t.songName,
        artist: t.artist,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to import playlist";
    console.error("Apple Music import error:", message);
    return errorResponse(message, 500);
  }
}
