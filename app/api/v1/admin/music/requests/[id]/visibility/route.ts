import { NextRequest } from "next/server";
import { queryOne, execute, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { SongRequest } from "@/lib/db-types";
import { SONG_BOOLS } from "@/lib/db-types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let isVisible = true;
    try {
      const body = await req.json();
      if (typeof body.isVisible === "boolean") isVisible = body.isVisible;
    } catch {
      // No body → default show
    }
    await execute(
      "UPDATE SongRequest SET isVisible = ? WHERE id = ?",
      [isVisible ? 1 : 0, id]
    );
    const updated = await queryOne<SongRequest>("SELECT * FROM SongRequest WHERE id = ?", [id]);
    if (updated) toBool(updated, ...SONG_BOOLS);
    return successResponse(updated);
  } catch (error) {
    console.error("Failed to toggle visibility:", error);
    return errorResponse("Internal server error.", 500);
  }
}
