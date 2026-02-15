import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.dJList.findMany();
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { songName, artist, listType } = body;

    if (!songName?.trim()) {
      return NextResponse.json({ error: "Song name is required." }, { status: 400 });
    }

    const item = await prisma.dJList.create({
      data: {
        songName: songName.trim(),
        artist: artist || "",
        listType: listType || "must-play",
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
