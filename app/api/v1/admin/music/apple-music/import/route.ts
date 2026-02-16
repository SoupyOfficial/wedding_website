import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  isAppleMusicConfigured,
  parsePlaylistUrl,
  fetchPlaylist,
} from "@/lib/apple-music";

/**
 * GET /api/v1/admin/music/apple-music/import?check=true
 * Check if Apple Music API credentials are configured.
 */
export async function GET(req: NextRequest) {
  const check = req.nextUrl.searchParams.get("check");
  if (check) {
    return NextResponse.json({
      success: true,
      data: { configured: isAppleMusicConfigured() },
    });
  }
  return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
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
      return NextResponse.json(
        {
          success: false,
          error:
            "Apple Music API not configured. Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY environment variables.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { url, listType = "must-play", playTime = "", skipDuplicates = true } = body;

    if (!url?.trim()) {
      return NextResponse.json(
        { success: false, error: "Playlist URL is required." },
        { status: 400 }
      );
    }

    // Parse the Apple Music playlist URL
    const parsed = parsePlaylistUrl(url.trim());
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Apple Music playlist URL. Expected format: https://music.apple.com/us/playlist/name/pl.xxxx",
        },
        { status: 400 }
      );
    }

    // Fetch playlist from Apple Music API
    const playlist = await fetchPlaylist(parsed.storefront, parsed.playlistId);

    if (playlist.tracks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Playlist is empty." },
        { status: 400 }
      );
    }

    // Get existing DJ list items to detect duplicates
    let existingSongs = new Set<string>();
    if (skipDuplicates) {
      const existing = await prisma.dJList.findMany({
        select: { songName: true, artist: true },
      });
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
      // Prisma doesn't support createMany with SQLite returning, so we batch
      for (const track of tracksToAdd) {
        await prisma.dJList.create({
          data: {
            songName: track.songName,
            artist: track.artist,
            listType,
            playTime: playTime || "",
          },
        });
        addedCount++;
      }
    }

    const skippedCount = playlist.tracks.length - addedCount;

    return NextResponse.json({
      success: true,
      data: {
        playlistName: playlist.name,
        totalTracks: playlist.tracks.length,
        addedCount,
        skippedCount,
        tracks: tracksToAdd.map((t) => ({
          songName: t.songName,
          artist: t.artist,
        })),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to import playlist";
    console.error("Apple Music import error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
