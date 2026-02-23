import { execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await execute("UPDATE ContactMessage SET isRead = 1 WHERE id = ?", [id]);
    return successResponse({ isRead: true });
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return errorResponse("Internal server error.", 500);
  }
}
