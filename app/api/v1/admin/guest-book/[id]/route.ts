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
    const { name, message } = body;

    const entry = await prisma.guestBookEntry.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(message !== undefined && { message: message.trim() }),
      },
    });

    return successResponse(entry);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Entry not found.", 404);
    }
    console.error("Failed to update guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guestBookEntry.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Entry not found.", 404);
    }
    console.error("Failed to delete guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}
