import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/middleware";
import { searchItunes } from "@/lib/itunes-search";

export const dynamic = "force-dynamic";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 15 });

/**
 * GET /api/v1/music/search?q=...&limit=8
 * Public proxy for the iTunes Search API (free, no credentials needed).
 */
export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  return searchItunes({
    query: req.nextUrl.searchParams.get("q"),
    limit: req.nextUrl.searchParams.get("limit") || undefined,
    defaultLimit: "8",
    errorLabel: "Music",
  });
}
