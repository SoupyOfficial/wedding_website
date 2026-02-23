import { query, toBoolAll } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Photo, PhotoTag, PhotoWithTags } from "@/lib/db-types";

export async function GET() {
  try {
    const photos = await query<Photo>(
      "SELECT * FROM Photo ORDER BY createdAt DESC"
    );
    toBoolAll(photos, "approved");

    // Load tags for all photos via the join table
    const photoIds = photos.map((p) => p.id);
    let tagsMap: Record<string, PhotoTag[]> = {};

    if (photoIds.length > 0) {
      const placeholders = photoIds.map(() => "?").join(", ");
      const tagRows = await query<PhotoTag & { photoId: string }>(
        `SELECT pt.*, j.A as photoId FROM PhotoTag pt
         INNER JOIN "_PhotoToPhotoTag" j ON j.B = pt.id
         WHERE j.A IN (${placeholders})`,
        photoIds
      );
      for (const row of tagRows) {
        if (!tagsMap[row.photoId]) tagsMap[row.photoId] = [];
        tagsMap[row.photoId].push({
          id: row.id,
          name: row.name,
          type: row.type,
          color: row.color,
          sortOrder: row.sortOrder,
          createdAt: row.createdAt,
        });
      }
    }

    const photosWithTags: PhotoWithTags[] = photos.map((p) => ({
      ...p,
      tags: tagsMap[p.id] || [],
    }));

    return successResponse(photosWithTags);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return errorResponse("Internal server error.", 500);
  }
}
