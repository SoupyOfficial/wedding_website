import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Entertainment } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, icon, sortOrder } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (description !== undefined) { sets.push("description = ?"); args.push(description); }
    if (icon !== undefined) { sets.push("icon = ?"); args.push(icon || null); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE Entertainment SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Entertainment item not found.", 404);

    const item = await queryOne<Entertainment>("SELECT * FROM Entertainment WHERE id = ?", [id]);
    return successResponse(item);
  } catch (error) {
    console.error("Failed to update entertainment:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM Entertainment WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Entertainment item not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete entertainment:", error);
    return errorResponse("Internal server error.", 500);
  }
}
