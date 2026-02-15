import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodSchema } from "zod";

export type ApiMiddleware = (
  req: NextRequest,
  ctx: Record<string, unknown>
) => Promise<NextResponse | null>;

/**
 * Chain multiple API middlewares. If any middleware returns a response,
 * the chain stops and that response is returned.
 */
export function withApiMiddleware(...middlewares: ApiMiddleware[]) {
  return async (
    req: NextRequest,
    handler: (
      req: NextRequest,
      ctx: Record<string, unknown>
    ) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const ctx: Record<string, unknown> = {};

    for (const middleware of middlewares) {
      const result = await middleware(req, ctx);
      if (result) return result;
    }

    return handler(req, ctx);
  };
}

/**
 * Require admin authentication
 */
export const requireAdmin: ApiMiddleware = async (_req, ctx) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  ctx.user = session.user;
  return null;
};

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(
  schema: ZodSchema<T>
): ApiMiddleware {
  return async (req, ctx) => {
    try {
      const body = await req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: result.error.flatten(),
          },
          { status: 400 }
        );
      }
      ctx.body = result.data;
      return null;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }
  };
}

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
