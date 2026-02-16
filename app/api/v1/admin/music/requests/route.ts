import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const requests = await prisma.songRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(requests);
  } catch (error) {
    console.error("Failed to fetch song requests:", error);
    return errorResponse("Internal server error.", 500);
  }
}
