import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { getVisibleEntries, createEntry } from "@/lib/services/guestbook.service";

export const dynamic = "force-dynamic";

const postLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });

export async function GET() {
  try {
    const enabled = await getFeatureFlag("guestBookEnabled");
    if (!enabled) return errorResponse("Guest book is currently disabled.", 403);
    const entries = await getVisibleEntries();
    return successResponse(entries);
  } catch (error) {
    console.error("Failed to fetch guest book entries:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  const limited = await postLimiter(req, {});
  if (limited) return limited;
  try {
    const enabled = await getFeatureFlag("guestBookEnabled");
    if (!enabled) return errorResponse("Guest book is currently disabled.", 403);

    const body = await req.json();
    const { name, message } = body;

    if (!name?.trim() || !message?.trim()) {
      return errorResponse("Name and message are required.", 400);
    }

    await createEntry(name, message);
    return successResponse({ message: "Thank you for your message!" }, undefined, 201);
  } catch (error) {
    console.error("Failed to create guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}
