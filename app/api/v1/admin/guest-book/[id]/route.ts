import { NextRequest } from "next/server";
import { queryOne, execute, now, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { GuestBookEntry } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, message } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (message !== undefined) { sets.push("message = ?"); args.push(message.trim()); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE GuestBookEntry SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    if (rowsAffected === 0) return errorResponse("Entry not found.", 404);

    const entry = await queryOne<GuestBookEntry>("SELECT * FROM GuestBookEntry WHERE id = ?", [id]);
    if (entry) toBool(entry, "isVisible");
    return successResponse(entry);
  } catch (error) {
    console.error("Failed to update guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM GuestBookEntry WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Entry not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}
