import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/middleware/admin-auth";
import { sitePassword } from "@/lib/middleware/site-password";

export default auth((req) => {
  return adminAuth(req) ?? sitePassword(req) ?? NextResponse.next();
});

export const config = {
  matcher: [
    // Admin API routes — must be authenticated
    "/api/v1/admin/:path*",
    // All non-static, non-API pages (site password gate + admin page redirects)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
