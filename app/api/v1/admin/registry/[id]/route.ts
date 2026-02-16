import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    const registry = await prisma.registryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(iconUrl !== undefined && { iconUrl: iconUrl || null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return successResponse(registry);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Registry item not found.", 404);
    }
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
    await prisma.registryItem.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Registry item not found.", 404);
    }
    console.error("Failed to delete registry item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
