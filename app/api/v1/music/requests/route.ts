import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { getVisibleRequests, createRequest } from "@/lib/services/song-request.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const enabled = await getFeatureFlag("songRequestsEnabled");
    if (!enabled) return errorResponse("Song requests are currently disabled.", 403);
    const songs = await getVisibleRequests();
    return successResponse(songs);
  } catch (error) {
    console.error("Failed to fetch visible songs:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const enabled = await getFeatureFlag("songRequestsEnabled");
    if (!enabled) return errorResponse("Song requests are currently disabled.", 403);

    const body = await req.json();
    const { guestName, songTitle } = body;

    if (!guestName?.trim() || !songTitle?.trim()) {
      return errorResponse("Name and song title are required.", 400);
    }

    const request = await createRequest(body);
    if (!request) {
      return errorResponse("You've already requested this song!", 409);
    }

    return successResponse(request, undefined, 201);
  } catch (error) {
    console.error("Failed to create song request:", error);
    return errorResponse("Internal server error.", 500);
  }
}
