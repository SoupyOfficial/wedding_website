import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { uploadPhoto, PhotoValidationError } from "@/lib/services/photo.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const enabled = await getFeatureFlag("photoUploadEnabled");
    if (!enabled) return errorResponse("Photo uploads are currently disabled.", 403);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const uploaderName = formData.get("uploaderName") as string | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return errorResponse("No file provided.", 400);
    }

    const result = await uploadPhoto({ file, caption, uploaderName, category });
    return successResponse(result, undefined, 201);
  } catch (error) {
    if (error instanceof PhotoValidationError) {
      return errorResponse(error.message, 400);
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to upload photo:", message);

    if (
      message.includes("read-only") ||
      message.includes("not configured") ||
      message.includes("CLOUDINARY")
    ) {
      return errorResponse(
        "Photo uploads are not available. Please contact the site administrators.",
        503
      );
    }

    return errorResponse("Failed to upload photo. Please try again.", 500);
  }
}
