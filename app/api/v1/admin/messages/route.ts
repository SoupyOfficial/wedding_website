import { query, toBoolAll } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { ContactMessage } from "@/lib/db-types";

export async function GET() {
  try {
    const messages = await query<ContactMessage>(
      "SELECT * FROM ContactMessage ORDER BY createdAt DESC"
    );
    toBoolAll(messages, "isRead");
    return successResponse(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return errorResponse("Internal server error.", 500);
  }
}
