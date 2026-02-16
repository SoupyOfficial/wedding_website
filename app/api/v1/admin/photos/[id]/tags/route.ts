import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT — set all tags for a photo (replaces existing)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: "tagIds must be an array." },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        tags: {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: { tags: true },
    });

    return NextResponse.json({ success: true, data: photo });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
