import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let approved = true;
    try {
      const body = await req.json();
      if (typeof body.approved === "boolean") approved = body.approved;
    } catch {
      // No body → default approve
    }
    await prisma.songRequest.update({
      where: { id },
      data: { approved },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
