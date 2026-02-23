import { NextRequest } from "next/server";
import { query, queryOne, execute, toBool } from "@/lib/db";
import { getProvider } from "@/lib/providers";
import { successResponse, errorResponse } from "@/lib/api";
import type { Photo, PhotoTag, PhotoWithTags } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { caption, category, approved } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (caption !== undefined) { sets.push("caption = ?"); args.push(caption); }
    if (category !== undefined) { sets.push("category = ?"); args.push(category); }
    if (approved !== undefined) { sets.push("approved = ?"); args.push(approved ? 1 : 0); }

    if (sets.length === 0) {
      return errorResponse("No fields to update.", 400);
    }

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE Photo SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    if (rowsAffected === 0) {
      return errorResponse("Photo not found.", 404);
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
    console.error("Failed to update photo:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photo = await queryOne<Photo>("SELECT * FROM Photo WHERE id = ?", [id]);
    if (!photo) {
      return errorResponse("Photo not found.", 404);
    }

    if (photo.storageKey) {
      try {
        const storage = getProvider("storage");
        await storage.delete(photo.storageKey);
      } catch {
        console.error(`Failed to delete storage key: ${photo.storageKey}`);
      }
    }

    // Delete join table entries first, then the photo
    await execute('DELETE FROM "_PhotoToPhotoTag" WHERE A = ?', [id]);
    await execute("DELETE FROM Photo WHERE id = ?", [id]);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return errorResponse("Internal server error.", 500);
  }
}
