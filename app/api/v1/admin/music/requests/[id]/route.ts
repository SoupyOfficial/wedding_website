import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.songRequest.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Song request not found.", 404);
    }
    console.error("Failed to delete song request:", error);
    return errorResponse("Internal server error.", 500);
  }
}
