import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/api/middleware";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const uploaderName = formData.get("uploaderName") as string | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    // Whitelist safe file extensions
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, GIF, and WebP files are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeCategory = category ? category.trim().slice(0, 50) : "guest-uploads";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload via the configured storage provider (local or Cloudinary)
    const storage = getProvider("storage");
    const result = await storage.upload(buffer, filename, {
      contentType: file.type,
      category: safeCategory,
    });

    // Sanitize text inputs
    const safeCaption = caption ? caption.trim().slice(0, 200) : "";
    const safeUploader = uploaderName ? uploaderName.trim().slice(0, 100) : null;

    const photo = await prisma.photo.create({
      data: {
        url: result.url,
        caption: safeCaption,
        uploadedBy: safeUploader,
        category: safeCategory,
        storageKey: result.key,
        approved: false,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: photo.id, url: photo.url } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
