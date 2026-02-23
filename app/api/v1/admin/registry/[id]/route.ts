import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { RegistryItem } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (url !== undefined) { sets.push("url = ?"); args.push(url.trim()); }
    if (iconUrl !== undefined) { sets.push("iconUrl = ?"); args.push(iconUrl || null); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE RegistryItem SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Registry item not found.", 404);

    const registry = await queryOne<RegistryItem>("SELECT * FROM RegistryItem WHERE id = ?", [id]);
    return successResponse(registry);
  } catch (error) {
    console.error("Failed to update registry item:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM RegistryItem WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Registry item not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete registry item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
