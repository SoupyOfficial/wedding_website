import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";

/**
 * GET /api/v1/music/search?q=...&limit=8
 * Public proxy for the iTunes Search API (free, no credentials needed).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const limit = req.nextUrl.searchParams.get("limit") || "8";

  if (!q || q.trim().length < 2) {
    return successResponse([]);
  }

  try {
    const params = new URLSearchParams({
      term: q.trim(),
      media: "music",
      entity: "song",
      limit,
    });

    const res = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return errorResponse("Music search unavailable", 502);
    }

    const data = await res.json();

    const results = (data.results || []).map(
      (item: {
        trackId: number;
        trackName: string;
        artistName: string;
        collectionName: string;
        trackTimeMillis: number;
        artworkUrl100: string;
        previewUrl: string;
      }) => ({
        id: item.trackId,
        songName: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        durationMs: item.trackTimeMillis,
        artworkUrl: item.artworkUrl100,
        previewUrl: item.previewUrl,
      })
    );

    return successResponse(results);
  } catch (error) {
    console.error("Failed to search iTunes:", error);
    return errorResponse("Failed to search music", 500);
  }
}
