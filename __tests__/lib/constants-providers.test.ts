import { describe, it, expect, vi } from "vitest";

// ─── constants ─────────────────────────────────────
import {
  PLAY_TIME_OPTIONS,
  DJ_LIST_TYPES,
  RSVP_STATUSES,
  TIMELINE_EVENT_TYPES,
} from "@/lib/constants";

describe("constants", () => {
  it("PLAY_TIME_OPTIONS has items with value and label", () => {
    expect(PLAY_TIME_OPTIONS.length).toBeGreaterThan(0);
    for (const opt of PLAY_TIME_OPTIONS) {
      expect(typeof opt.value).toBe("string");
      expect(typeof opt.label).toBe("string");
    }
  });

  it("DJ_LIST_TYPES includes must-play and do-not-play", () => {
    const values = DJ_LIST_TYPES.map((t) => t.value);
    expect(values).toContain("must-play");
    expect(values).toContain("do-not-play");
  });

  it("RSVP_STATUSES includes pending, attending, declined", () => {
    const values = RSVP_STATUSES.map((s) => s.value);
    expect(values).toContain("pending");
    expect(values).toContain("attending");
    expect(values).toContain("declined");
  });

  it("TIMELINE_EVENT_TYPES has items", () => {
    expect(TIMELINE_EVENT_TYPES.length).toBeGreaterThan(0);
  });
});

// ─── providers/index ───────────────────────────────

// We need to mock the storage/email provider constructors for this module
vi.mock("@/lib/providers/storage/local.storage", () => ({
  LocalStorageProvider: vi.fn().mockImplementation(() => ({
    upload: vi.fn(),
    delete: vi.fn(),
    getUrl: vi.fn(),
  })),
}));

vi.mock("@/lib/providers/storage/cloudinary.storage", () => ({
  CloudinaryStorageProvider: vi.fn().mockImplementation(() => ({
    upload: vi.fn(),
    delete: vi.fn(),
    getUrl: vi.fn(),
  })),
}));

vi.mock("@/lib/providers/email/noop.email", () => ({
  NoOpEmailProvider: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    sendBatch: vi.fn(),
    isConfigured: vi.fn().mockReturnValue(false),
  })),
}));

import { getProvider, registerProvider } from "@/lib/providers";

describe("providers", () => {
  it("getProvider returns storage provider", () => {
    const storage = getProvider("storage");
    expect(storage).toBeDefined();
  });

  it("getProvider returns email provider", () => {
    const email = getProvider("email");
    expect(email).toBeDefined();
  });

  it("registerProvider replaces a provider", () => {
    const mockStorage = { upload: vi.fn(), delete: vi.fn(), getUrl: vi.fn() } as any;
    registerProvider("storage", mockStorage);
    expect(getProvider("storage")).toBe(mockStorage);
  });
});

// ─── NoOpEmailProvider ─────────────────────────────
// Test the real NoOpEmailProvider directly
describe("NoOpEmailProvider", () => {
  it("send returns success", async () => {
    // Import the real class (not mocked for this test)
    const { NoOpEmailProvider } = await vi.importActual<typeof import("@/lib/providers/email/noop.email")>("@/lib/providers/email/noop.email");
    const provider = new NoOpEmailProvider();
    const result = await provider.send({ to: "test@test.com", subject: "Hi", html: "<p>hi</p>" });
    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^noop-/);
  });

  it("sendBatch sends all", async () => {
    const { NoOpEmailProvider } = await vi.importActual<typeof import("@/lib/providers/email/noop.email")>("@/lib/providers/email/noop.email");
    const provider = new NoOpEmailProvider();
    const results = await provider.sendBatch([
      { to: "a@a.com", subject: "A", html: "<p>a</p>" },
      { to: "b@b.com", subject: "B", html: "<p>b</p>" },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
  });

  it("isConfigured returns false", async () => {
    const { NoOpEmailProvider } = await vi.importActual<typeof import("@/lib/providers/email/noop.email")>("@/lib/providers/email/noop.email");
    const provider = new NoOpEmailProvider();
    expect(provider.isConfigured()).toBe(false);
  });
});
