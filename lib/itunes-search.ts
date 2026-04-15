import { successResponse, errorResponse } from "@/lib/api";

export interface iTunesTrack {
  id: number;
  songName: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl: string;
  previewUrl: string;
}

interface SearchOptions {
  query: string | null;
  limit?: string;
  defaultLimit?: string;
  errorLabel?: string;
}

/**
 * Search the iTunes API for songs and return a standardized response.
 * Shared by both public and admin search endpoints.
 */
export async function searchItunes({
  query,
  limit,
  defaultLimit = "10",
  errorLabel = "iTunes",
}: SearchOptions): Promise<Response> {
  if (!query || query.trim().length < 2) {
    return successResponse([]);
  }

  try {
    const params = new URLSearchParams({
      term: query.trim(),
      media: "music",
      entity: "song",
      limit: limit || defaultLimit,
    });

    const res = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return errorResponse(`${errorLabel} search unavailable`, 502);
    }

    const data = await res.json();

    const results: iTunesTrack[] = (data.results || []).map(
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
    console.error(`Failed to search ${errorLabel}:`, error);
    return errorResponse(`Failed to search ${errorLabel.toLowerCase()}`, 500);
  }
}
