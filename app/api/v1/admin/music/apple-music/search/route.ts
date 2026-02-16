import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/admin/music/apple-music/search?q=...&limit=10
 * Proxies the iTunes Search API to avoid CORS issues.
 * No Apple Developer credentials needed — this is a free public API.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const limit = req.nextUrl.searchParams.get("limit") || "10";

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ success: true, data: [] });
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
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "iTunes API error" },
        { status: 502 }
      );
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

    return NextResponse.json({ success: true, data: results });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to search iTunes" },
      { status: 500 }
    );
  }
}
