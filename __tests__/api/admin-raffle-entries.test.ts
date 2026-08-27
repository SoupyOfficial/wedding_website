import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  execute: vi.fn(),
  generateId: vi.fn(),
  now: vi.fn(),
}));

import { query } from "@/lib/db";
import { GET } from "@/app/api/v1/admin/raffle/entries/route";

const mockQuery = vi.mocked(query);

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.mockResolvedValue([]);
});

describe("GET /api/v1/admin/raffle/entries", () => {
  it("returns attending RSVP entries with a count", async () => {
    const rows = [
      {
        id: "g1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        rsvpSubmittedAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "g2",
        firstName: "Grace",
        lastName: "Hopper",
        email: null,
        rsvpSubmittedAt: "2026-06-02T00:00:00.000Z",
      },
    ];
    mockQuery.mockResolvedValue(rows);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(rows);
    expect(body.meta.count).toBe(rows.length);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the database query fails", async () => {
    mockQuery.mockRejectedValue(new Error("db down"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
