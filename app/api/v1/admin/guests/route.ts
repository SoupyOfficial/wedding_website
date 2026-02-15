import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: guests });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, group, plusOneAllowed } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email || null,
        group: group || null,
        plusOneAllowed: plusOneAllowed || false,
      },
    });

    return NextResponse.json({ success: true, data: guest }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
