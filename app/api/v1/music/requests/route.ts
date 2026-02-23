import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now, isUniqueViolation } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { SongRequest } from "@/lib/db-types";

export async function GET() {
  try {
    const songs = await query<Pick<SongRequest, "id" | "songTitle" | "artist" | "artworkUrl" | "guestName">>(
      "SELECT id, songTitle, artist, artworkUrl, guestName FROM SongRequest WHERE approved = 1 AND isVisible = 1 ORDER BY createdAt DESC"
    );
    return successResponse(songs);
  } catch (error) {
    console.error("Failed to fetch visible songs:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, songTitle, artist, artworkUrl, previewUrl } = body;

    if (!guestName?.trim() || !songTitle?.trim()) {
      return errorResponse("Name and song title are required.", 400);
    }

    const existing = await queryOne<SongRequest>(
      "SELECT id FROM SongRequest WHERE guestName = ? AND songTitle = ? AND artist = ? LIMIT 1",
      [guestName.trim(), songTitle.trim(), (artist || "").trim()]
    );

    if (existing) {
      return errorResponse("You've already requested this song!", 409);
    }

    const id = generateId();
    const timestamp = now();
    await execute(
      "INSERT INTO SongRequest (id, guestName, songTitle, artist, artworkUrl, previewUrl, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)",
      [id, guestName.trim(), songTitle.trim(), (artist || "").trim(), artworkUrl || null, previewUrl || null, timestamp]
    );

    const request = await queryOne<SongRequest>("SELECT * FROM SongRequest WHERE id = ?", [id]);
    return successResponse(request, undefined, 201);
  } catch (error) {
    console.error("Failed to create song request:", error);
    return errorResponse("Internal server error.", 500);
  }
}
