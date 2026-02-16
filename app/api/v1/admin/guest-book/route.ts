import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const entries = await prisma.guestBookEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(entries);
  } catch (error) {
    console.error("Failed to fetch guest book:", error);
    return errorResponse("Internal server error.", 500);
  }
}
