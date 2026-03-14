import { NextRequest } from "next/server";
import { execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let approved = true;
    try {
      const body = await req.json();
      if (typeof body.approved === "boolean") approved = body.approved;
    } catch {
      // No body → default approve
    }
    const { rowsAffected } = await execute(
      "UPDATE Photo SET approved = ? WHERE id = ?",
      [approved ? 1 : 0, id]
    );
    if (rowsAffected === 0) {
      return errorResponse("Photo not found.", 404);
    }
    return successResponse({ approved });
  } catch (error) {
    console.error("Failed to update photo approval:", error);
    return errorResponse("Internal server error.", 500);
  }
}
