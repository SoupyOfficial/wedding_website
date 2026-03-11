import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/api/middleware";
import { NextRequest } from "next/server";

function makeReq(ip = "127.0.0.1", path = "/api/test"): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  // Each test uses a unique path/ip to avoid cross-test state
  let counter = 0;
  function uniqueReq() {
    counter++;
    return makeReq(`10.0.0.${counter}`, `/api/test-${counter}`);
  }

  it("allows requests under the limit", async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });
    const req = uniqueReq();
    const r1 = await limiter(req, {});
    const r2 = await limiter(req, {});
    const r3 = await limiter(req, {});
    expect(r1).toBeNull();
    expect(r2).toBeNull();
    expect(r3).toBeNull();
  });

  it("blocks requests over the limit", async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 2 });
    const req = uniqueReq();
    await limiter(req, {});
    await limiter(req, {});
    const blocked = await limiter(req, {});
    expect(blocked).not.toBeNull();
    const body = await blocked!.json();
    expect(blocked!.status).toBe(429);
    expect(body.error).toBe("Too many requests");
  });

  it("uses different buckets per IP", async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1 });
    const path = `/api/unique-${++counter}`;
    const r1 = await limiter(makeReq("1.1.1.1", path), {});
    const r2 = await limiter(makeReq("2.2.2.2", path), {});
    expect(r1).toBeNull();
    expect(r2).toBeNull();
  });

  it("falls back to 'unknown' when no IP headers", async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1 });
    const path = `/api/noip-${++counter}`;
    const req = new NextRequest(`http://localhost:3000${path}`);
    const result = await limiter(req, {});
    expect(result).toBeNull();
  });
});
