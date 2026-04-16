import { successResponse, errorResponse } from "@/lib/api";
import { getSettings } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

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
export async function GET() {
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
