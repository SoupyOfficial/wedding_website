import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import type { DJList } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 30 });

/**
 * GET /api/v1/music/dj-playlist
 * Returns the couple's curated DJ playlist for public display.
 */
export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
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
