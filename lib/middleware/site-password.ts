import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site password gate for public pages.
 * Redirects unauthenticated visitors to /site-password when the feature is enabled.
 * Returns null if the request should continue to the next handler.
 */
export function sitePassword(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) return null;

  const sitePasswordEnabled =
    req.cookies.get("site-password-enabled")?.value === "true";

  if (!sitePasswordEnabled) return null;

  const hasAccess =
    req.cookies.get("site-access")?.value === "granted";

  if (!hasAccess && pathname !== "/site-password") {
    return NextResponse.redirect(new URL("/site-password", req.url));
  }

  return null;
}
