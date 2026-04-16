import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { submitRsvp } from "@/lib/services/rsvp.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const enabled = await getFeatureFlag("rsvpEnabled");
    if (!enabled) return errorResponse("RSVP is currently closed.", 403);

    const body = await req.json();
    const { guestId, attending } = body;

    if (!guestId || typeof attending !== "boolean") {
      return errorResponse("Missing required fields.", 400);
    }

    const result = await submitRsvp(body);

    if ("error" in result) {
      const status = result.error === "Guest not found." ? 404 : 400;
      return errorResponse(result.error, status);
    }

    return successResponse(result);
  } catch (error) {
    console.error("Failed to submit RSVP:", error);
    return errorResponse("Internal server error.", 500);
  }
}
