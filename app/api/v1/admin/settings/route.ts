import { NextRequest } from "next/server";
import { queryOne, execute, now, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";

export async function GET() {
  try {
    const settings = await queryOne<SiteSettings>(
      "SELECT * FROM SiteSettings WHERE id = ?",
      ["singleton"]
    );
    if (settings) toBool(settings, ...SETTINGS_BOOLS);

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

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    const fields: [string, unknown][] = [
      ["coupleName", body.coupleName],
      ["weddingDate", body.weddingDate ? new Date(body.weddingDate).toISOString() : undefined],
      ["weddingTime", body.weddingTime ?? null],
      ["venueName", body.venueName],
      ["venueAddress", body.venueAddress],
      ["ceremonyType", body.ceremonyType],
      ["dressCode", body.dressCode],
      ["contactEmailJoint", body.contactEmailJoint ?? ""],
      ["contactEmailBride", body.contactEmailBride ?? ""],
      ["contactEmailGroom", body.contactEmailGroom ?? ""],
      ["weddingHashtag", body.weddingHashtag ?? ""],
      ["sitePasswordEnabled", body.sitePasswordEnabled ? 1 : 0],
      ["rsvpDeadline", body.rsvpDeadline ? new Date(body.rsvpDeadline).toISOString() : null],
      ["rsvpEnabled", (body.rsvpEnabled ?? true) ? 1 : 0],
      ["heroTagline", body.heroTagline ?? ""],
      ["heroTaglinePostWedding", body.heroTaglinePostWedding ?? ""],
      ["ourStoryContent", body.ourStoryContent ?? ""],
      ["travelContent", body.travelContent ?? ""],
      ["preWeddingContent", body.preWeddingContent ?? ""],
      ["postWeddingContent", body.postWeddingContent ?? ""],
      ["weatherInfo", body.weatherInfo ?? ""],
      ["parkingInfo", body.parkingInfo ?? ""],
      ["childrenPolicy", body.childrenPolicy ?? ""],
      ["faqContent", body.faqContent ?? ""],
      ["photoShareLink", body.photoShareLink ?? ""],
      ["ogImage", body.ogImage ?? ""],
      ["ogDescription", body.ogDescription ?? ""],
      ["socialInstagram", body.socialInstagram ?? ""],
      ["socialFacebook", body.socialFacebook ?? ""],
      ["socialTikTok", body.socialTikTok ?? ""],
      ["notifyOnRsvp", (body.notifyOnRsvp ?? true) ? 1 : 0],
      ["notificationEmail", body.notificationEmail ?? ""],
      ["bannerText", body.bannerText ?? ""],
      ["bannerUrl", body.bannerUrl ?? ""],
      ["bannerActive", (body.bannerActive ?? false) ? 1 : 0],
      ["bannerColor", body.bannerColor ?? "gold"],
      ["registryNote", body.registryNote ?? ""],
      ["entertainmentNote", body.entertainmentNote ?? ""],
      ["raffleTicketCount", body.raffleTicketCount ?? 2],
    ];

    // Only update password if a real value was sent
    if (body.sitePassword && body.sitePassword !== "••••••••") {
      fields.push(["sitePassword", body.sitePassword]);
    }

    for (const [col, val] of fields) {
      if (val !== undefined) {
        sets.push(`${col} = ?`);
        args.push(val as string | number | null);
      }
    }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push("singleton");

    await execute(
      `UPDATE SiteSettings SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    const settings = await queryOne<SiteSettings>(
      "SELECT * FROM SiteSettings WHERE id = ?",
      ["singleton"]
    );
    if (settings) toBool(settings, ...SETTINGS_BOOLS);

    return successResponse(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return errorResponse("Internal server error.", 500);
  }
}
