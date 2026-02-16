import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isVisible = body.isVisible !== undefined ? body.isVisible : true;

    await prisma.guestBookEntry.update({
      where: { id },
      data: { isVisible },
    });
    return successResponse({ isVisible });
  } catch (error) {
    console.error("Failed to update guest book visibility:", error);
    return errorResponse("Internal server error.", 500);
  }
}
