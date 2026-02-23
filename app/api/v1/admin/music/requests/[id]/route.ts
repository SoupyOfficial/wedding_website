import { execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM SongRequest WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Song request not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete song request:", error);
    return errorResponse("Internal server error.", 500);
  }
}
