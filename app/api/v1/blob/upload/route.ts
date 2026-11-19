import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getFeatureFlag } from "@/lib/config/feature-flags";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const enabled = await getFeatureFlag("photoUploadEnabled");
  if (!enabled) {
    return NextResponse.json(
      { error: "Photo uploads are currently disabled." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif",
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/x-m4v",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
