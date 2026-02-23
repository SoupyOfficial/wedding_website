import { NextRequest } from "next/server";
import { execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isVisible = body.isVisible !== undefined ? body.isVisible : true;

    await execute(
      "UPDATE GuestBookEntry SET isVisible = ? WHERE id = ?",
      [isVisible ? 1 : 0, id]
    );
    return successResponse({ isVisible });
  } catch (error) {
    console.error("Failed to update guest book visibility:", error);
    return errorResponse("Internal server error.", 500);
  }
}
