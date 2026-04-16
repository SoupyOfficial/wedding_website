import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { lookupGuest } from "@/lib/services/rsvp.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 10 });

export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  const enabled = await getFeatureFlag("rsvpEnabled");
  if (!enabled) return errorResponse("RSVP is currently closed.", 403);

  const name = req.nextUrl.searchParams.get("name");

  if (!name || name.trim().length < 2) {
    return errorResponse("Please provide a valid name.", 400);
  }

  try {
    const result = await lookupGuest(name);
    if (!result) {
      return errorResponse("Guest not found. Please check the name on your invitation.", 404);
    }
    return successResponse(result);
  } catch (error) {
    console.error("Failed to lookup RSVP:", error);
    return errorResponse("Internal server error.", 500);
  }
}
