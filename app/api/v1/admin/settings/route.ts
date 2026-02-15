import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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

    return NextResponse.json({ success: true, data: safeSettings });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: {
        coupleName: body.coupleName,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
        weddingTime: body.weddingTime,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        ceremonyType: body.ceremonyType,
        dressCode: body.dressCode,
        contactEmailJoint: body.contactEmailJoint ?? "",
        contactEmailBride: body.contactEmailBride ?? "",
        contactEmailGroom: body.contactEmailGroom ?? "",
        weddingHashtag: body.weddingHashtag ?? "",
        sitePassword: body.sitePassword ?? "",
        sitePasswordEnabled: body.sitePasswordEnabled ?? false,
        rsvpDeadline: body.rsvpDeadline ? new Date(body.rsvpDeadline) : null,
        rsvpEnabled: body.rsvpEnabled ?? true,
        heroTagline: body.heroTagline ?? "",
        ourStoryContent: body.ourStoryContent ?? "",
        travelContent: body.travelContent ?? "",
        weatherInfo: body.weatherInfo ?? "",
        parkingInfo: body.parkingInfo ?? "",
        childrenPolicy: body.childrenPolicy ?? "",
        faqContent: body.faqContent ?? "",
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

    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
