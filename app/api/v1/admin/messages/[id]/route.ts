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
    const { isRead } = body;

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { ...(isRead !== undefined && { isRead }) },
    });

    return successResponse(message);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Message not found.", 404);
    }
    console.error("Failed to update message:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Message not found.", 404);
    }
    console.error("Failed to delete message:", error);
    return errorResponse("Internal server error.", 500);
  }
}
