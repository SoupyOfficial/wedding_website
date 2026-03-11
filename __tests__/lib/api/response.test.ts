import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "@/lib/api/response";

describe("successResponse", () => {
  it("returns 200 with success: true by default", async () => {
    const res = successResponse({ items: [1, 2] });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { items: [1, 2] } });
  });

  it("includes meta when provided", async () => {
    const res = successResponse("ok", { total: 5 });
    const body = await res.json();
    expect(body).toEqual({ success: true, data: "ok", meta: { total: 5 } });
  });

  it("supports custom status code", async () => {
    const res = successResponse(null, undefined, 201);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: null });
  });
});

describe("errorResponse", () => {
  it("returns 400 with success: false by default", async () => {
    const res = errorResponse("Bad input");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: "Bad input" });
  });

  it("supports custom status code", async () => {
    const res = errorResponse("Not found", 404);
    expect(res.status).toBe(404);
  });

  it("includes error code when provided", async () => {
    const res = errorResponse("Duplicate", 409, "DUPLICATE");
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: "Duplicate",
      code: "DUPLICATE",
    });
  });
});
