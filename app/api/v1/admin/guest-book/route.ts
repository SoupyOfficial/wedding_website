import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const entries = await prisma.guestBookEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: entries });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
