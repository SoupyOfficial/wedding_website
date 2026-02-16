import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH update a tag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const body = await req.json();
    const { name, type, color } = body;

    const updateData: Record<string, string> = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (type) updateData.type = type;
    if (color) updateData.color = color;

    const tag = await prisma.photoTag.update({
      where: { id: tagId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: tag });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE a tag
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    await prisma.photoTag.delete({ where: { id: tagId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
