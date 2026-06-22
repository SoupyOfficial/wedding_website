import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { getSettings } from "@/lib/services/settings.service";
import { rateLimit } from "@/lib/api/middleware";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 30 });

const PUBLIC_FIELDS = [
  "coupleName",
  "weddingDate",
  "weddingHashtag",
  "venueName",
  "venueAddress",
  "contactEmailJoint",
  "contactEmailBride",
  "contactEmailGroom",
  "socialInstagram",
  "socialFacebook",
  "socialTikTok",
  "heroTagline",
  "ceremonyType",
  "registryNote",
  "entertainmentNote",
  "rsvpDeadline",
  "childrenPolicy",
] as const;

/**
 * GET /api/v1/settings/public
 * Returns non-sensitive site settings for public-facing client components.
 */
export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const settings = await getSettings(...PUBLIC_FIELDS);

    if (!settings) {
      return errorResponse("Settings not found", 404);
    }

    return successResponse(settings);
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return errorResponse("Internal server error", 500);
  }
}
