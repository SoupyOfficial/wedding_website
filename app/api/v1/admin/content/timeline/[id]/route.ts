import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, time, icon, sortOrder, eventType } = body;

    const event = await prisma.timelineEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description || "" }),
        ...(time !== undefined && { time: time || "" }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(eventType !== undefined && { eventType }),
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.timelineEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
