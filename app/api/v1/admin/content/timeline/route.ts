import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const events = await prisma.timelineEvent.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: events });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, time, icon, sortOrder } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const event = await prisma.timelineEvent.create({
      data: {
        title: title.trim(),
        description: description || null,
        time: time || null,
        icon: icon || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
