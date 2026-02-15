import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
