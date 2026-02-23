import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now, isUniqueViolation } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { PhotoTag } from "@/lib/db-types";

// GET all tags with photo counts
export async function GET() {
  try {
    const tags = await query<PhotoTag & { photoCount: number }>(
      `SELECT pt.*, COALESCE(c.cnt, 0) as photoCount
       FROM PhotoTag pt
       LEFT JOIN (
         SELECT B, COUNT(*) as cnt FROM "_PhotoToPhotoTag" GROUP BY B
       ) c ON c.B = pt.id
       ORDER BY pt.type ASC, pt.sortOrder ASC, pt.name ASC`
    );

    // Shape to match Prisma's _count format
    const result = tags.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      color: t.color,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt,
      _count: { photos: t.photoCount },
    }));

    return successResponse(result);
  } catch (error) {
    console.error("Failed to fetch photo tags:", error);
    return errorResponse("Internal server error.", 500);
  }
}

// POST create a new tag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return errorResponse("Tag name is required.", 400);
    }

    const validTypes = ["event", "person", "date", "location", "custom"];
    const tagType = validTypes.includes(type) ? type : "custom";

    const id = generateId();
    await execute(
      "INSERT INTO PhotoTag (id, name, type, color, sortOrder, createdAt) VALUES (?, ?, ?, ?, 0, ?)",
      [id, name.trim(), tagType, color || "#C9A84C", now()]
    );

    const tag = await queryOne<PhotoTag>("SELECT * FROM PhotoTag WHERE id = ?", [id]);
    return successResponse(tag, undefined, 201);
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      return errorResponse("A tag with that name and type already exists.", 409);
    }
    console.error("Failed to create photo tag:", err);
    return errorResponse("Internal server error.", 500);
  }
}
