import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/api/middleware";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { password } = body;

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings?.sitePasswordEnabled || !settings.sitePassword) {
      return NextResponse.json({ success: true });
    }

    if (password !== settings.sitePassword) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("site-password", "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
