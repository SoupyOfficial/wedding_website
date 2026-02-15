import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const msg = await prisma.contactMessage.create({
      data: {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 200),
        subject: subject.trim().slice(0, 200),
        message: message.trim().slice(0, 2000),
      },
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
