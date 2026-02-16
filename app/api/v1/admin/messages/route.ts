import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return errorResponse("Internal server error.", 500);
  }
}
