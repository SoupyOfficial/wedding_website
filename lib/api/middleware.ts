import { NextRequest, NextResponse } from "next/server";

export type ApiMiddleware = (
  req: NextRequest,
  ctx: Record<string, unknown>
) => Promise<NextResponse | null>;

/**
 * Simple rate limiting middleware
 */
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

export function rateLimit(opts: {
  windowMs: number;
  maxRequests: number;
}): ApiMiddleware {
  return async (req) => {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();
    const existing = rateLimitMap.get(key);

    if (existing && now < existing.resetTime) {
      if (existing.count >= opts.maxRequests) {
        return NextResponse.json(
          { success: false, error: "Too many requests" },
          { status: 429 }
        );
      }
      existing.count++;
    } else {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + opts.windowMs,
      });
    }

    return null;
  };
}
