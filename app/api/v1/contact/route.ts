import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { submitMessage } from "@/lib/services/contact.service";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const enabled = await getFeatureFlag("contactPageEnabled");
    if (!enabled) return errorResponse("Contact form is currently disabled.", 403);

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return errorResponse("All fields are required.", 400);
    }

    await submitMessage({ name, email, subject, message });
    return successResponse({ message: "Message sent successfully." }, undefined, 201);
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return errorResponse("Internal server error.", 500);
  }
}
