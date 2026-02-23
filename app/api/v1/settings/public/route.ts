import { queryOne } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { SiteSettings } from "@/lib/db-types";

/**
 * GET /api/v1/settings/public
 * Returns non-sensitive site settings for public-facing client components.
 */
export async function GET() {
  try {
    const settings = await queryOne<SiteSettings>(
      "SELECT * FROM SiteSettings WHERE id = ?",
      ["singleton"]
    );

    if (!settings) {
      return errorResponse("Settings not found", 404);
    }

    // Only expose non-sensitive fields
    return successResponse({
      coupleName: settings.coupleName,
      weddingDate: settings.weddingDate,
      weddingHashtag: settings.weddingHashtag,
      venueName: settings.venueName,
      venueAddress: settings.venueAddress,
      contactEmailJoint: settings.contactEmailJoint,
      contactEmailBride: settings.contactEmailBride,
      contactEmailGroom: settings.contactEmailGroom,
      socialInstagram: settings.socialInstagram,
      socialFacebook: settings.socialFacebook,
      socialTikTok: settings.socialTikTok,
      heroTagline: settings.heroTagline,
      ceremonyType: settings.ceremonyType,
    });
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return errorResponse("Internal server error", 500);
  }
}
