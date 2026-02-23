import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { DJList } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { songName, artist, listType, playTime } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (songName !== undefined) { sets.push("songName = ?"); args.push(songName.trim()); }
    if (artist !== undefined) { sets.push("artist = ?"); args.push(artist || ""); }
    if (listType !== undefined) { sets.push("listType = ?"); args.push(listType); }
    if (playTime !== undefined) { sets.push("playTime = ?"); args.push(playTime || ""); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE DJList SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("DJ list item not found.", 404);

    const item = await queryOne<DJList>("SELECT * FROM DJList WHERE id = ?", [id]);
    return successResponse(item);
  } catch (error) {
    console.error("Failed to update DJ list item:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM DJList WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("DJ list item not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete DJ list item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
