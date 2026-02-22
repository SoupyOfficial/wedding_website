import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

/**
 * POST /api/v1/admin/music/requests/[id]/visibility
 * Toggle whether an approved song is visible on the public playlist.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let isVisible = true;
    try {
      const body = await req.json();
      if (typeof body.isVisible === "boolean") isVisible = body.isVisible;
    } catch {
      // No body → default show
    }
    const updated = await prisma.songRequest.update({
      where: { id },
      data: { isVisible },
    });
    return successResponse(updated);
  } catch (error) {
    console.error("Failed to toggle visibility:", error);
    return errorResponse("Internal server error.", 500);
  }
}
