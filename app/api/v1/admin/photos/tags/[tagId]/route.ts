import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

// PATCH update a tag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const body = await req.json();
    const { name, type, color } = body;

    const updateData: Record<string, string> = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (type) updateData.type = type;
    if (color) updateData.color = color;

    const tag = await prisma.photoTag.update({
      where: { id: tagId },
      data: updateData,
    });

    return successResponse(tag);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Tag not found.", 404);
    }
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
    await prisma.photoTag.delete({ where: { id: tagId } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Tag not found.", 404);
    }
    console.error("Failed to delete photo tag:", error);
    return errorResponse("Internal server error.", 500);
  }
}
