import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return successResponse({ isRead: true });
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return errorResponse("Internal server error.", 500);
  }
}
