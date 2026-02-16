import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { songName, artist, listType, playTime } = body;

    const item = await prisma.dJList.update({
      where: { id },
      data: {
        ...(songName !== undefined && { songName: songName.trim() }),
        ...(artist !== undefined && { artist: artist || "" }),
        ...(listType !== undefined && { listType }),
        ...(playTime !== undefined && { playTime: playTime || "" }),
      },
    });

    return successResponse(item);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("DJ list item not found.", 404);
    }
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
    await prisma.dJList.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("DJ list item not found.", 404);
    }
    console.error("Failed to delete DJ list item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
