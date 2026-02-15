import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const registries = await prisma.registryItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: registries });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const registry = await prisma.registryItem.create({
      data: {
        name: name.trim(),
        url: url?.trim() || "",
        iconUrl: iconUrl || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: registry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
