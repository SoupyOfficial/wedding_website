import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/v1/settings/public
 * Returns non-sensitive site settings for public-facing client components.
 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Settings not found" },
        { status: 404 }
      );
    }

    // Only expose non-sensitive fields
    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
