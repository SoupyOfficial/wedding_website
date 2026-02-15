import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const requests = await prisma.songRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: requests });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
