import { query, toBoolAll } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { SongRequest } from "@/lib/db-types";
import { SONG_BOOLS } from "@/lib/db-types";

export async function GET() {
  try {
    const requests = await query<SongRequest>(
      "SELECT * FROM SongRequest ORDER BY createdAt DESC"
    );
    toBoolAll(requests, ...SONG_BOOLS);
    return successResponse(requests);
  } catch (error) {
    console.error("Failed to fetch song requests:", error);
    return errorResponse("Internal server error.", 500);
  }
}
