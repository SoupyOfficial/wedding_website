import { execute, generateId, now } from "@/lib/db";
import { getProvider } from "@/lib/providers";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface PhotoUploadInput {
  file: File;
  caption?: string | null;
  uploaderName?: string | null;
  category?: string | null;
}

export interface PhotoUploadResult {
  id: string;
  url: string;
}

/**
 * Validate and upload a photo, returning the new photo id and url.
 * Throws on validation failure with a descriptive message.
 */
export async function uploadPhoto(input: PhotoUploadInput): Promise<PhotoUploadResult> {
  const { file, caption, uploaderName, category } = input;

  if (!file.type.startsWith("image/")) {
    throw new PhotoValidationError("File must be an image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new PhotoValidationError("File must be under 10MB.");
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new PhotoValidationError("Only JPG, PNG, GIF, and WebP files are allowed.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeCategory = category ? category.trim().slice(0, 50) : "guest-uploads";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const storage = getProvider("storage");
  const result = await storage.upload(buffer, filename, {
    contentType: file.type,
    category: safeCategory,
  });

  const safeCaption = caption ? caption.trim().slice(0, 200) : "";
  const safeUploader = uploaderName ? uploaderName.trim().slice(0, 100) : null;

  const id = generateId();
  await execute(
    "INSERT INTO Photo (id, url, caption, uploadedBy, category, storageKey, approved, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)",
    [id, result.url, safeCaption, safeUploader, safeCategory, result.key, now()]
  );

  return { id, url: result.url };
}

/** Validation error for photo uploads (client error, not server error). */
export class PhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoValidationError";
  }
}
