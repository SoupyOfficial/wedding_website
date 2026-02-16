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
    const { title, description, time, icon, sortOrder, eventType } = body;

    const event = await prisma.timelineEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description || "" }),
        ...(time !== undefined && { time: time || "" }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(eventType !== undefined && { eventType }),
      },
    });

    return successResponse(event);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Event not found.", 404);
    }
    console.error("Failed to update timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.timelineEvent.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Event not found.", 404);
    }
    console.error("Failed to delete timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}
