import { describe, it, expect } from "vitest";
import { generateId, now, toBool, toBoolAll, isUniqueViolation } from "@/lib/db";

describe("generateId", () => {
  it("returns a valid UUID v4 string", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });
});

describe("now", () => {
  it("returns an ISO 8601 string", () => {
    const ts = now();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

describe("toBool", () => {
  it("converts 1 to true", () => {
    const row = { active: 1, name: "test" };
    toBool(row, "active");
    expect(row.active).toBe(true);
  });

  it("converts 0 to false (keeps falsy)", () => {
    const row = { active: 0, name: "test" } as Record<string, unknown>;
    toBool(row, "active");
    // 0 is not === 1 and not === true, so it stays 0
    // Actually looking at the code: if (f in r) { r[f] = r[f] === 1 || r[f] === true; }
    // 0 === 1 is false, 0 === true is false, so r[f] becomes false
    expect(row.active).toBe(false);
  });

  it("converts true to true", () => {
    const row = { active: true };
    toBool(row, "active");
    expect(row.active).toBe(true);
  });

  it("handles multiple fields", () => {
    const row = { a: 1, b: 0, c: "hello" } as Record<string, unknown>;
    toBool(row, "a", "b");
    expect(row.a).toBe(true);
    expect(row.b).toBe(false);
    expect(row.c).toBe("hello");
  });

  it("ignores fields not present on the row", () => {
    const row = { name: "test" };
    toBool(row, "nonExistent");
    expect(row).toEqual({ name: "test" });
  });
});

describe("toBoolAll", () => {
  it("applies toBool to all rows", () => {
    const rows = [
      { active: 1, name: "a" },
      { active: 0, name: "b" },
    ] as Array<Record<string, unknown>>;
    toBoolAll(rows, "active");
    expect(rows[0].active).toBe(true);
    expect(rows[1].active).toBe(false);
  });

  it("returns the same array reference", () => {
    const rows = [{ x: 1 }] as Array<Record<string, unknown>>;
    const result = toBoolAll(rows, "x");
    expect(result).toBe(rows);
  });
});

describe("isUniqueViolation", () => {
  it("returns true for UNIQUE constraint error", () => {
    const err = new Error("UNIQUE constraint failed: Guest.email");
    expect(isUniqueViolation(err)).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isUniqueViolation(new Error("connection timeout"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isUniqueViolation("string error")).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });
});
