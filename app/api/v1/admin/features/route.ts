import { NextRequest } from "next/server";
import { getFeatureFlags, setFeatureFlag } from "@/lib/config/feature-flags";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flags = await getFeatureFlags();
    return successResponse(flags);
  } catch (error) {
    console.error("Failed to fetch feature flags:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, enabled } = body;

    if (!key || typeof key !== "string") {
      return errorResponse("Feature flag key is required.", 400);
    }

    if (typeof enabled !== "boolean") {
      return errorResponse("Enabled must be a boolean.", 400);
    }

    await setFeatureFlag(key, enabled);
    const flags = await getFeatureFlags();

    return successResponse(flags);
  } catch (error) {
    console.error("Failed to update feature flag:", error);
    return errorResponse("Internal server error.", 500);
  }
}
