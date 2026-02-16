import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { songName, artist, listType } = body;

    const item = await prisma.dJList.update({
      where: { id },
      data: {
        ...(songName !== undefined && { songName: songName.trim() }),
        ...(artist !== undefined && { artist: artist || "" }),
        ...(listType !== undefined && { listType }),
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ error: "DJ list item not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dJList.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
