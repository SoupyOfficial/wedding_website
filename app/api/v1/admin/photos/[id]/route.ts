import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getProvider } from "@/lib/providers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { caption, category, approved } = body;

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(category !== undefined && { category }),
        ...(approved !== undefined && { approved }),
      },
      include: { tags: true },
    });

    return NextResponse.json({ success: true, data: photo });
  } catch {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch photo to get storage key before deleting
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    // Delete from storage provider if we have a key
    if (photo.storageKey) {
      try {
        const storage = getProvider("storage");
        await storage.delete(photo.storageKey);
      } catch {
        // Log but don't block DB deletion if storage delete fails
        console.error(`Failed to delete storage key: ${photo.storageKey}`);
      }
    }

    await prisma.photo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
