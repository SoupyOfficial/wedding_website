import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { PhotoTag } from "@/lib/db-types";

// PATCH update a tag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const body = await req.json();
    const { name, type, color } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name && typeof name === "string") { sets.push("name = ?"); args.push(name.trim()); }
    if (type) { sets.push("type = ?"); args.push(type); }
    if (color) { sets.push("color = ?"); args.push(color); }

    if (sets.length === 0) {
      return errorResponse("No fields to update.", 400);
    }

    args.push(tagId);
    const { rowsAffected } = await execute(
      `UPDATE PhotoTag SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    if (rowsAffected === 0) {
      return errorResponse("Tag not found.", 404);
    }

    const tag = await queryOne<PhotoTag>("SELECT * FROM PhotoTag WHERE id = ?", [tagId]);
    return successResponse(tag);
  } catch (error) {
    console.error("Failed to update photo tag:", error);
    return errorResponse("Internal server error.", 500);
  }
}

// DELETE a tag
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    // Remove join table entries first
    await execute('DELETE FROM "_PhotoToPhotoTag" WHERE B = ?', [tagId]);
    const { rowsAffected } = await execute("DELETE FROM PhotoTag WHERE id = ?", [tagId]);

    if (rowsAffected === 0) {
      return errorResponse("Tag not found.", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete photo tag:", error);
    return errorResponse("Internal server error.", 500);
  }
}
