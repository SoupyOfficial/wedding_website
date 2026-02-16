import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });
    return successResponse(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return errorResponse("Internal server error.", 500);
  }
}
