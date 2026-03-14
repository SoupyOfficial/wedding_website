import { query } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { DJList } from "@/lib/db-types";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/music/dj-playlist
 * Returns the couple's curated DJ playlist for public display.
 */
export async function GET() {
  try {
    const items = await query<Pick<DJList, "id" | "songName" | "artist" | "listType">>(
      "SELECT id, songName, artist, listType FROM DJList ORDER BY listType ASC, songName ASC"
    );
    return successResponse(items);
  } catch (error) {
    console.error("Failed to fetch DJ playlist:", error);
    return errorResponse("Internal server error.", 500);
  }
}
