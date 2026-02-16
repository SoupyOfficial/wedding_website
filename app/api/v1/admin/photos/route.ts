import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });
    return NextResponse.json({ success: true, data: photos });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
