import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

// GET all tags
export async function GET() {
  try {
    const tags = await prisma.photoTag.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { photos: true } } },
    });
    return successResponse(tags);
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

    const tag = await prisma.photoTag.create({
      data: {
        name: name.trim(),
        type: tagType,
        color: color || "#C9A84C",
      },
    });

    return successResponse(tag, undefined, 201);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return errorResponse("A tag with that name and type already exists.", 409);
    }
    console.error("Failed to create photo tag:", err);
    return errorResponse("Internal server error.", 500);
  }
}
