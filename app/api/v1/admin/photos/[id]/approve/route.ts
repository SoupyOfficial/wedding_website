import { execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await execute("UPDATE Photo SET approved = 1 WHERE id = ?", [id]);
    return successResponse({ approved: true });
  } catch (error) {
    console.error("Failed to approve photo:", error);
    return errorResponse("Internal server error.", 500);
  }
}
