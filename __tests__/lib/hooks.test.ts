import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { useAdminFetch, useAdminMultiFetch } from "@/lib/hooks/use-admin-fetch";
import { usePublicSettings } from "@/lib/hooks/use-public-settings";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAdminFetch", () => {
  it("fetches data and sets it", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: "1", name: "Guest" }] }),
    });

    const { result } = renderHook(() => useAdminFetch("/api/v1/admin/guests"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0]).toEqual({ id: "1", name: "Guest" });
  });

  it("sets error on failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAdminFetch("/api/v1/admin/guests"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load data.");
  });

  it("refetch reloads data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: "1" }] }),
    });

    const { result } = renderHook(() => useAdminFetch("/api/v1/admin/guests"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("useAdminMultiFetch", () => {
  it("fetches multiple endpoints in parallel", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: [{ id: "1" }] }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: [{ id: "2" }] }),
      });

    const { result } = renderHook(() =>
      useAdminMultiFetch({ guests: "/api/v1/admin/guests", meals: "/api/v1/admin/meals" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.guests).toHaveLength(1);
    expect(result.current.data.meals).toHaveLength(1);
  });
});

describe("usePublicSettings", () => {
  it("fetches and returns settings", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { coupleName: "J & A", weddingDate: "2026-10-10" },
        }),
    });

    const { result } = renderHook(() => usePublicSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.settings?.coupleName).toBe("J & A");
  });

  it("handles fetch failure gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => usePublicSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.settings).toBeNull();
  });
});
