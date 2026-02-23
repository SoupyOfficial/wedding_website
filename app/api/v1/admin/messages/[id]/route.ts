import { NextRequest } from "next/server";
import { queryOne, execute, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { ContactMessage } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isRead } = body;

    if (isRead === undefined) return errorResponse("No fields to update.", 400);

    const { rowsAffected } = await execute(
      "UPDATE ContactMessage SET isRead = ? WHERE id = ?",
      [isRead ? 1 : 0, id]
    );

    if (rowsAffected === 0) return errorResponse("Message not found.", 404);

    const message = await queryOne<ContactMessage>("SELECT * FROM ContactMessage WHERE id = ?", [id]);
    if (message) toBool(message, "isRead");
    return successResponse(message);
  } catch (error) {
    console.error("Failed to update message:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM ContactMessage WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Message not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return errorResponse("Internal server error.", 500);
  }
}
