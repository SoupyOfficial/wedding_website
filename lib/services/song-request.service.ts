import { query, queryOne, execute, generateId, now } from "@/lib/db";
import type { SongRequest } from "@/lib/db-types";

/**
 * Get all approved and visible song requests.
 */
export async function getVisibleRequests() {
  return query<Pick<SongRequest, "id" | "songTitle" | "artist" | "artworkUrl" | "guestName">>(
    "SELECT id, songTitle, artist, artworkUrl, guestName FROM SongRequest WHERE approved = 1 AND isVisible = 1 ORDER BY createdAt DESC"
  );
}

export interface SongRequestInput {
  guestName: string;
  songTitle: string;
  artist?: string;
  artworkUrl?: string | null;
  previewUrl?: string | null;
}

/**
 * Create a song request if not a duplicate.
 * Returns the created request, or null if duplicate.
 */
export async function createRequest(input: SongRequestInput): Promise<SongRequest | null> {
  const { guestName, songTitle, artist, artworkUrl, previewUrl } = input;
  const trimmedName = guestName.trim();
  const trimmedTitle = songTitle.trim();
  const trimmedArtist = (artist || "").trim();

  const existing = await queryOne<SongRequest>(
    "SELECT id FROM SongRequest WHERE guestName = ? AND songTitle = ? AND artist = ? LIMIT 1",
    [trimmedName, trimmedTitle, trimmedArtist]
  );
  if (existing) return null;

  const id = generateId();
  const timestamp = now();
  await execute(
    "INSERT INTO SongRequest (id, guestName, songTitle, artist, artworkUrl, previewUrl, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)",
    [id, trimmedName, trimmedTitle, trimmedArtist, artworkUrl || null, previewUrl || null, timestamp]
  );

  return queryOne<SongRequest>("SELECT * FROM SongRequest WHERE id = ?", [id]);
}
