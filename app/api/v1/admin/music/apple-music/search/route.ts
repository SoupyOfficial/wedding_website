import { NextRequest } from "next/server";
import { searchItunes } from "@/lib/itunes-search";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/music/apple-music/search?q=...&limit=10
 * Proxies the iTunes Search API to avoid CORS issues.
 * No Apple Developer credentials needed — this is a free public API.
 */
export async function GET(req: NextRequest) {
  return searchItunes({
    query: req.nextUrl.searchParams.get("q"),
    limit: req.nextUrl.searchParams.get("limit") || undefined,
    defaultLimit: "10",
    errorLabel: "iTunes",
  });
}
