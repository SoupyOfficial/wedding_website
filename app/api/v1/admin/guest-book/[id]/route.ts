import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, message } = body;

    const entry = await prisma.guestBookEntry.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(message !== undefined && { message: message.trim() }),
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guestBookEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
