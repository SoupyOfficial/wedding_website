import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    const registry = await prisma.registryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(iconUrl !== undefined && { iconUrl: iconUrl || null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ success: true, data: registry });
  } catch {
    return NextResponse.json({ error: "Registry item not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.registryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registry item not found." }, { status: 404 });
  }
}
