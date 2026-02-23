import { query, toBoolAll } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { GuestBookEntry } from "@/lib/db-types";

export async function GET() {
  try {
    const entries = await query<GuestBookEntry>(
      "SELECT * FROM GuestBookEntry ORDER BY createdAt DESC"
    );
    toBoolAll(entries, "isVisible");
    return successResponse(entries);
  } catch (error) {
    console.error("Failed to fetch guest book:", error);
    return errorResponse("Internal server error.", 500);
  }
}
