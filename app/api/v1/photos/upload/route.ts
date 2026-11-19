import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { uploadPhoto, PhotoValidationError } from "@/lib/services/photo.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 10 });

interface PhotoResult {
  name: string;
  status: "uploaded" | "failed";
  id?: string;
  url?: string;
  error?: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return String(error);
}

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const enabled = await getFeatureFlag("photoUploadEnabled");
    if (!enabled) return errorResponse("Photo uploads are currently disabled.", 403);

    const formData = await req.formData();
    const caption = formData.get("caption") as string | null;
    const uploaderName = formData.get("uploaderName") as string | null;
    const category = formData.get("category") as string | null;

    // Support batch uploads ("files") and legacy single uploads ("file")
    const batch = formData.getAll("files") as File[];
    const single = formData.get("file") as File | null;
    const files: File[] = batch.length > 0 ? batch : single ? [single] : [];

    if (files.length === 0) {
      return errorResponse("No file provided.", 400);
    }

    const results: PhotoResult[] = [];

    for (const file of files) {
      try {
        const result = await uploadPhoto({ file, caption, uploaderName, category });
        results.push({ name: file.name, status: "uploaded", id: result.id, url: result.url });
      } catch (error) {
        if (error instanceof PhotoValidationError) {
          results.push({ name: file.name, status: "failed", error: error.message });
          continue;
        }

        const message = toErrorMessage(error);
        console.error(
          "Failed to upload photo:",
          message,
          "| raw:",
          typeof error === "object" && error !== null ? JSON.stringify(error) : String(error)
        );
        if (
          message.includes("read-only") ||
          message.includes("not configured") ||
          message.includes("BLOB_READ_WRITE_TOKEN")
        ) {
          return errorResponse(
            "Photo uploads are not available. Please contact the site administrators.",
            503
          );
        }

        return errorResponse("Failed to upload photo. Please try again.", 500);
      }
    }

    const uploadedCount = results.filter((r) => r.status === "uploaded").length;
    if (uploadedCount === 0) {
      return errorResponse(results[0]?.error || "No valid photos to upload.", 400);
    }

    return successResponse(
      { results, uploadedCount, failedCount: results.length - uploadedCount },
      undefined,
      201
    );
  } catch (error) {
    const message = toErrorMessage(error);
    console.error(
      "Failed to upload photo:",
      message,
      "| raw:",
      typeof error === "object" && error !== null ? JSON.stringify(error) : String(error)
    );
    return errorResponse("Failed to upload photo. Please try again.", 500);
  }
}
