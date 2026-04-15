import { NextRequest } from "next/server";
import { searchItunes } from "@/lib/itunes-search";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/music/search?q=...&limit=8
 * Public proxy for the iTunes Search API (free, no credentials needed).
 */
export async function GET(req: NextRequest) {
  return searchItunes({
    query: req.nextUrl.searchParams.get("q"),
    limit: req.nextUrl.searchParams.get("limit") || undefined,
    defaultLimit: "8",
    errorLabel: "Music",
  });
}
