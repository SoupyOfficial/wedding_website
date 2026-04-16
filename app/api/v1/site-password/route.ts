import { NextRequest } from "next/server";
import { getSettings } from "@/lib/services/settings.service";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { password } = body;

    const settings = await getSettings("sitePasswordEnabled", "sitePassword");

    if (!settings?.sitePasswordEnabled || !settings.sitePassword) {
      return successResponse({ verified: true });
    }

    if (!password || typeof password !== "string" || password.length > 200) {
      return errorResponse("Invalid password.", 400);
    }

    if (password !== settings.sitePassword) {
      return errorResponse("Incorrect password.", 401);
    }

    const cookieStore = await cookies();
    cookieStore.set("site-password", "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return successResponse({ verified: true });
  } catch (error) {
    console.error("Failed to verify site password:", error);
    return errorResponse("Internal server error.", 500);
  }
}
