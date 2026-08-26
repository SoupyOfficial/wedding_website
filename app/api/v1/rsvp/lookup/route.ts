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

  const firstName = req.nextUrl.searchParams.get("firstName");
  const lastName = req.nextUrl.searchParams.get("lastName");

  if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
    return errorResponse("Please provide both first and last name.", 400);
  }

  try {
    const result = await lookupGuest(firstName.trim(), lastName.trim());
    if (!result) {
      return errorResponse(
        "We couldn't find a guest with that name. Please check the spelling on your invitation, or contact Jacob & Ashley for help.",
        404
      );
    }

    return successResponse(result);
  } catch (error) {
    console.error("Failed to lookup RSVP:", error);
    return errorResponse("Internal server error.", 500);
  }
}
