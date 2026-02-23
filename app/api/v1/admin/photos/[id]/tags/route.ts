import { NextRequest } from "next/server";
import { query, queryOne, execute, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Photo, PhotoTag, PhotoWithTags } from "@/lib/db-types";

// PUT — set all tags for a photo (replaces existing)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return errorResponse("tagIds must be an array.", 400);
    }

    // Remove all existing tag associations
    await execute('DELETE FROM "_PhotoToPhotoTag" WHERE A = ?', [id]);

    // Insert new associations
    for (const tagId of tagIds) {
      await execute(
        'INSERT INTO "_PhotoToPhotoTag" (A, B) VALUES (?, ?)',
        [id, tagId]
      );
    }

    const photo = await queryOne<Photo>("SELECT * FROM Photo WHERE id = ?", [id]);
    if (photo) toBool(photo, "approved");

    const tags = await query<PhotoTag>(
      `SELECT pt.* FROM PhotoTag pt
       INNER JOIN "_PhotoToPhotoTag" j ON j.B = pt.id
       WHERE j.A = ?`,
      [id]
    );

    const result: PhotoWithTags = { ...photo!, tags };
    return successResponse(result);
  } catch (error) {
    console.error("Failed to update photo tags:", error);
    return errorResponse("Internal server error.", 500);
  }
}
