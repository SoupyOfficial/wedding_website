import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all tags
export async function GET() {
  try {
    const tags = await prisma.photoTag.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { photos: true } } },
    });
    return NextResponse.json({ success: true, data: tags });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST create a new tag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Tag name is required." },
        { status: 400 }
      );
    }

    const validTypes = ["event", "person", "date", "location", "custom"];
    const tagType = validTypes.includes(type) ? type : "custom";

    const tag = await prisma.photoTag.create({
      data: {
        name: name.trim(),
        type: tagType,
        color: color || "#C9A84C",
      },
    });

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A tag with that name and type already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
