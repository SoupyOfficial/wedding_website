import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { registerPhotos, type RegisteredPhotoInput } from "@/lib/services/photo.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 20 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;

  try {
    const enabled = await getFeatureFlag("photoUploadEnabled");
    if (!enabled) return errorResponse("Photo uploads are currently disabled.", 403);

    const body = await req.json();
    const items = body?.items as Array<{ url?: string; name?: string }> | undefined;
    const uploaderName = (body?.uploaderName as string | null) ?? null;
    const caption = (body?.caption as string | null) ?? null;
    const category = (body?.category as string | null) ?? null;

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse("No files provided.", 400);
    }

    const inputs: RegisteredPhotoInput[] = items.map((item) => ({
      url: item?.url || "",
      name: item?.name || null,
      caption,
      uploaderName,
      category,
    }));

    const results = await registerPhotos(inputs);

    const uploadedCount = results.filter((r) => r.status === "uploaded").length;
    if (uploadedCount === 0) {
      return errorResponse(results[0]?.error || "No valid photos to save.", 400);
    }

    return successResponse(
      { results, uploadedCount, failedCount: results.length - uploadedCount },
      undefined,
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to register photo:", message);
    return errorResponse("Failed to save photo. Please try again.", 500);
  }
}
