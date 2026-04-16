import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin API route guard.
 * Returns a 401 JSON response if the user is not authenticated.
 * Returns null if the request should continue to the next handler.
 */
export function adminAuth(req: NextRequest & { auth?: { user?: unknown } }): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/v1/admin")) return null;

  if (!req.auth?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}
