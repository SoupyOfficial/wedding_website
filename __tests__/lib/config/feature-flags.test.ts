import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing feature-flags
vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn(),
  toBool: vi.fn((row: unknown) => row),
  generateId: vi.fn().mockReturnValue("test-id"),
  now: vi.fn().mockReturnValue("2026-01-01T00:00:00.000Z"),
}));

import { query, queryOne, execute } from "@/lib/db";
import {
  getFeatureFlags,
  getFeatureFlag,
  setFeatureFlag,
} from "@/lib/config/feature-flags";

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFeatureFlags", () => {
  it("returns defaults when DB returns empty array", async () => {
    mockQuery.mockResolvedValue([]);
    const flags = await getFeatureFlags();
    expect(flags.rsvpEnabled).toBe(true);
    expect(flags.photoUploadEnabled).toBe(false);
    expect(flags.guestBookEnabled).toBe(true);
  });

  it("overrides defaults with DB values", async () => {
    mockQuery.mockResolvedValue([
      { key: "rsvpEnabled", enabled: 0 },
      { key: "photoUploadEnabled", enabled: 1 },
    ]);
    const flags = await getFeatureFlags();
    expect(flags.rsvpEnabled).toBe(false);
    expect(flags.photoUploadEnabled).toBe(true);
    // Unmentioned flags keep defaults
    expect(flags.guestBookEnabled).toBe(true);
  });

  it("handles boolean enabled values from DB", async () => {
    mockQuery.mockResolvedValue([
      { key: "rsvpEnabled", enabled: true },
    ]);
    const flags = await getFeatureFlags();
    expect(flags.rsvpEnabled).toBe(true);
  });

  it("returns defaults on DB error", async () => {
    mockQuery.mockRejectedValue(new Error("connection failed"));
    const flags = await getFeatureFlags();
    expect(flags.rsvpEnabled).toBe(true);
    expect(flags.photoUploadEnabled).toBe(false);
  });
});

describe("getFeatureFlag", () => {
  it("returns DB value when flag exists", async () => {
    mockQueryOne.mockResolvedValue({ key: "rsvpEnabled", enabled: 0 });
    expect(await getFeatureFlag("rsvpEnabled")).toBe(false);
  });

  it("returns default when flag not in DB", async () => {
    mockQueryOne.mockResolvedValue(null);
    expect(await getFeatureFlag("rsvpEnabled")).toBe(true);
    expect(await getFeatureFlag("photoUploadEnabled")).toBe(false);
  });

  it("returns false for unknown flag not in DB", async () => {
    mockQueryOne.mockResolvedValue(null);
    expect(await getFeatureFlag("unknownFlag")).toBe(false);
  });

  it("returns default on DB error", async () => {
    mockQueryOne.mockRejectedValue(new Error("fail"));
    expect(await getFeatureFlag("rsvpEnabled")).toBe(true);
  });
});

describe("setFeatureFlag", () => {
  it("updates existing flag", async () => {
    mockQueryOne.mockResolvedValue({ key: "rsvpEnabled", enabled: 1 });
    mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });

    await setFeatureFlag("rsvpEnabled", false);

    expect(mockExecute).toHaveBeenCalledWith(
      "UPDATE FeatureFlag SET enabled = ?, updatedAt = ? WHERE key = ?",
      [0, "2026-01-01T00:00:00.000Z", "rsvpEnabled"]
    );
  });

  it("inserts new flag if not exists", async () => {
    mockQueryOne.mockResolvedValue(null);
    mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });

    await setFeatureFlag("newFlag", true);

    expect(mockExecute).toHaveBeenCalledWith(
      "INSERT INTO FeatureFlag (id, key, enabled, updatedAt) VALUES (?, ?, ?, ?)",
      ["test-id", "newFlag", 1, "2026-01-01T00:00:00.000Z"]
    );
  });
});
