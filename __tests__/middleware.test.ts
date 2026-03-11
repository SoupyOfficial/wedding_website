import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock auth to simply pass through the handler
vi.mock("@/lib/auth", () => ({
  auth: (handler: Function) => (req: any, event: any) => handler(req, event),
}));

import middleware from "@/middleware";

function makeReq(path: string, opts: { auth?: { user: {} } | null; cookies?: Record<string, string> } = {}) {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url);
  (req as any).auth = opts.auth !== undefined ? opts.auth : null;
  if (opts.cookies) {
    for (const [k, v] of Object.entries(opts.cookies)) {
      req.cookies.set(k, v);
    }
  }
  return req;
}

describe("middleware", () => {
  describe("admin API routes", () => {
    it("returns 401 JSON for unauthenticated admin API requests", async () => {
      const req = makeReq("/api/v1/admin/guests", { auth: null });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it("allows authenticated admin API requests", async () => {
      const req = makeReq("/api/v1/admin/guests", { auth: { user: { email: "admin@test.com" } } });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(200);
    });
  });

  describe("site password gate", () => {
    it("allows access when site password is not enabled", async () => {
      const req = makeReq("/our-story", { cookies: {} });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(200);
    });

    it("redirects to /site-password when enabled and no access", async () => {
      const req = makeReq("/our-story", {
        cookies: { "site-password-enabled": "true" },
      });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/site-password");
    });

    it("allows access when site-access cookie is granted", async () => {
      const req = makeReq("/our-story", {
        cookies: { "site-password-enabled": "true", "site-access": "granted" },
      });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(200);
    });

    it("does not redirect the /site-password page itself", async () => {
      const req = makeReq("/site-password", {
        cookies: { "site-password-enabled": "true" },
      });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(200);
    });

    it("does not apply site password gate to admin routes", async () => {
      const req = makeReq("/admin/guests", {
        auth: { user: { email: "admin@test.com" } },
        cookies: { "site-password-enabled": "true" },
      });
      const res = await (middleware as any)(req, {}) as NextResponse;
      expect(res.status).toBe(200);
    });
  });
});
