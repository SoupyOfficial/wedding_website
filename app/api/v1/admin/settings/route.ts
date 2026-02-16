import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    // Redact the site password — only expose whether it's set
    const safeSettings = settings
      ? {
          ...settings,
          sitePassword: settings.sitePassword ? "••••••••" : "",
        }
      : null;

    return successResponse(safeSettings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Don't overwrite the password if the masked placeholder is sent back
    const passwordUpdate =
      body.sitePassword && body.sitePassword !== "••••••••"
        ? { sitePassword: body.sitePassword }
        : {};

    const settings = await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: {
        coupleName: body.coupleName,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
        weddingTime: body.weddingTime ?? null,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        ceremonyType: body.ceremonyType,
        dressCode: body.dressCode,
        contactEmailJoint: body.contactEmailJoint ?? "",
        contactEmailBride: body.contactEmailBride ?? "",
        contactEmailGroom: body.contactEmailGroom ?? "",
        weddingHashtag: body.weddingHashtag ?? "",
        ...passwordUpdate,
        sitePasswordEnabled: body.sitePasswordEnabled ?? false,
        rsvpDeadline: body.rsvpDeadline ? new Date(body.rsvpDeadline) : null,
        rsvpEnabled: body.rsvpEnabled ?? true,
        heroTagline: body.heroTagline ?? "",
        heroTaglinePostWedding: body.heroTaglinePostWedding ?? "",
        ourStoryContent: body.ourStoryContent ?? "",
        travelContent: body.travelContent ?? "",
        preWeddingContent: body.preWeddingContent ?? "",
        postWeddingContent: body.postWeddingContent ?? "",
        weatherInfo: body.weatherInfo ?? "",
        parkingInfo: body.parkingInfo ?? "",
        childrenPolicy: body.childrenPolicy ?? "",
        faqContent: body.faqContent ?? "",
        photoShareLink: body.photoShareLink ?? "",
        ogImage: body.ogImage ?? "",
        ogDescription: body.ogDescription ?? "",
        socialInstagram: body.socialInstagram ?? "",
        socialFacebook: body.socialFacebook ?? "",
        socialTikTok: body.socialTikTok ?? "",
        notifyOnRsvp: body.notifyOnRsvp ?? true,
        notificationEmail: body.notificationEmail ?? "",
        bannerText: body.bannerText ?? "",
        bannerUrl: body.bannerUrl ?? "",
        bannerActive: body.bannerActive ?? false,
        bannerColor: body.bannerColor ?? "gold",
      },
    });

    return successResponse(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return errorResponse("Internal server error.", 500);
  }
}
