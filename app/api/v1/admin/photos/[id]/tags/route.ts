import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

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

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        tags: {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: { tags: true },
    });

    return successResponse(photo);
  } catch (error) {
    console.error("Failed to update photo tags:", error);
    return errorResponse("Internal server error.", 500);
  }
}
