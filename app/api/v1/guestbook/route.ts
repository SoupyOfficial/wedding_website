import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";

const postLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });

export async function GET() {
  try {
    const entries = await prisma.guestBookEntry.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = await postLimiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { name, message } = body;

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }

    const entry = await prisma.guestBookEntry.create({
      data: {
        name: name.trim().slice(0, 100),
        message: message.trim().slice(0, 500),
        isVisible: false,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your message!" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
