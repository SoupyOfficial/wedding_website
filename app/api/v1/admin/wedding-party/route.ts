import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const members = await prisma.weddingPartyMember.findMany({
      orderBy: [{ side: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ success: true, data: members });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, side, bio, photoUrl, sortOrder } = body;

    if (!name?.trim() || !role?.trim() || !side?.trim()) {
      return NextResponse.json(
        { error: "Name, role, and side are required." },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
