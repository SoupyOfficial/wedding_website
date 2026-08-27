import { describe, it, expect } from "vitest";
import { daysUntilEasternDate } from "@/lib/timezone";

describe("daysUntilEasternDate", () => {
  it("returns 1 day for a target one Eastern day ahead", () => {
    expect(
      daysUntilEasternDate(
        "2026-11-13",
        new Date("2026-11-12T23:00:00-05:00")
      )
    ).toBe(1);
  });

  it("returns 0 when the Eastern date equals the target date (EST)", () => {
    expect(
      daysUntilEasternDate("2026-11-13", new Date("2026-11-13T05:30:00Z"))
    ).toBe(0);
  });

  it("returns -1 for a target one Eastern day in the past", () => {
    expect(
      daysUntilEasternDate("2026-11-13", new Date("2026-11-14T10:00:00Z"))
    ).toBe(-1);
  });

  it("is DST-aware (EDT): 1 day from July 3 to July 4", () => {
    expect(
      daysUntilEasternDate("2026-07-04", new Date("2026-07-03T23:00:00-04:00"))
    ).toBe(1);
  });

  it("returns 0 for an empty string and does not throw", () => {
    expect(daysUntilEasternDate("")).toBe(0);
  });

  it("returns 0 for a non-date string and does not throw", () => {
    expect(daysUntilEasternDate("not-a-date")).toBe(0);
  });

  it("returns a finite number when `now` is omitted", () => {
    const result = daysUntilEasternDate("2026-11-13");
    expect(typeof result).toBe("number");
    expect(Number.isFinite(result)).toBe(true);
  });

  it("counts 12 Eastern days across the Nov 1 DST fall-back boundary", () => {
    expect(
      daysUntilEasternDate(
        "2026-11-13",
        new Date("2026-11-01T22:00:00-05:00")
      )
    ).toBe(12);
  });
});
