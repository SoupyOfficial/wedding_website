/**
 * Shared test helpers: mock DB, mock Next.js request/response, etc.
 */
import { vi } from "vitest";
import { NextRequest } from "next/server";

// ─── Mock DB ──────────────────────────────────────────────────

export function mockDb(overrides: Record<string, unknown> = {}) {
  const mocks = {
    query: vi.fn().mockResolvedValue([]),
    queryOne: vi.fn().mockResolvedValue(null),
    execute: vi.fn().mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined }),
    generateId: vi.fn().mockReturnValue("test-id-123"),
    now: vi.fn().mockReturnValue("2026-06-15T00:00:00.000Z"),
    toBool: vi.fn((row: unknown) => row),
    toBoolAll: vi.fn((rows: unknown[]) => rows),
    isUniqueViolation: vi.fn().mockReturnValue(false),
    ...overrides,
  };

  vi.doMock("@/lib/db", () => mocks);
  return mocks;
}

// ─── Mock Request Factory ─────────────────────────────────────

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "GET", body, headers = {}, searchParams } = options;

  let fullUrl = `http://localhost:3000${url}`;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    fullUrl += `?${params.toString()}`;
  }

  const init: RequestInit & { signal?: AbortSignal } = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(fullUrl, init);
}

// ─── Response Parser ──────────────────────────────────────────

export async function parseResponse<T = unknown>(
  response: Response
): Promise<{ status: number; body: { success: boolean; data?: T; error?: string; meta?: Record<string, unknown> } }> {
  const status = response.status;
  const body = await response.json();
  return { status, body };
}

// ─── Feature Flags Helper ─────────────────────────────────────

export const DEFAULT_FEATURE_FLAGS = {
  rsvpEnabled: true,
  guestBookEnabled: true,
  photoUploadEnabled: false,
  registrySyncEnabled: false,
  songRequestsEnabled: true,
  entertainmentPageEnabled: true,
  guestPhotoSharingEnabled: false,
  liveGuestCountEnabled: false,
  massEmailEnabled: true,
  ourStoryPageEnabled: true,
  eventDetailsPageEnabled: true,
  travelPageEnabled: true,
  weddingPartyPageEnabled: true,
  galleryPageEnabled: true,
  registryPageEnabled: true,
  faqPageEnabled: true,
  contactPageEnabled: true,
  musicPageEnabled: true,
  photosOfUsPageEnabled: true,
};
