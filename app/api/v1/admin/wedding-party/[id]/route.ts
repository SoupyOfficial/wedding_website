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
    const { name, role, side, bio, photoUrl, sortOrder } = body;

    const { relationToBrideOrGroom, spouseOrPartner } = body;

    const member = await prisma.weddingPartyMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role: role.trim() }),
        ...(side !== undefined && { side: side.trim() }),
        ...(bio !== undefined && { bio: bio || "" }),
        ...(photoUrl !== undefined && { photoUrl: photoUrl || null }),
        ...(relationToBrideOrGroom !== undefined && { relationToBrideOrGroom: relationToBrideOrGroom || "" }),
        ...(spouseOrPartner !== undefined && { spouseOrPartner: spouseOrPartner || "" }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return successResponse(member);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Member not found.", 404);
    }
    console.error("Failed to update member:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.weddingPartyMember.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Member not found.", 404);
    }
    console.error("Failed to delete member:", error);
    return errorResponse("Internal server error.", 500);
  }
}
