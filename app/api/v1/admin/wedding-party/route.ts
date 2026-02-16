import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const members = await prisma.weddingPartyMember.findMany({
      orderBy: [{ side: "asc" }, { sortOrder: "asc" }],
    });
    return successResponse(members);
  } catch (error) {
    console.error("Failed to fetch wedding party:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, side, bio, photoUrl, sortOrder } = body;

    if (!name?.trim() || !role?.trim() || !side?.trim()) {
      return errorResponse("Name, role, and side are required.", 400);
    }

    const member = await prisma.weddingPartyMember.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        side: side.trim(),
        bio: bio || null,
        photoUrl: photoUrl || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(member, undefined, 201);
  } catch (error) {
    console.error("Failed to create wedding party member:", error);
    return errorResponse("Internal server error.", 500);
  }
}
