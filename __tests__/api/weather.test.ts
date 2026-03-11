import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { queryOne } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);

import { GET } from "@/app/api/v1/weather/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Weather API", () => {
  it("returns 400 when wedding date not set", async () => {
    mockQueryOne.mockResolvedValue({ id: "singleton", weddingDate: null });
    const req = new NextRequest("http://l/api/v1/weather");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns forecast data for near-future date", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      weddingDate: future.toISOString(),
      venueName: "The Manor",
    });

    const hourlyTime = future.toISOString().split("T")[0] + "T12:00";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        hourly: {
          time: [hourlyTime],
          temperature_2m: [85],
          apparent_temperature: [90],
          relative_humidity_2m: [60],
          precipitation_probability: [30],
          precipitation: [0],
          weather_code: [2],
          wind_speed_10m: [10],
          wind_gusts_10m: [15],
          cloud_cover: [40],
          uv_index: [8],
        },
        daily: {
          temperature_2m_max: [90],
          temperature_2m_min: [75],
          precipitation_probability_max: [30],
          sunrise: ["06:30"],
          sunset: ["20:15"],
          uv_index_max: [10],
          weather_code: [2],
        },
      }),
    });

    const req = new NextRequest("http://l/api/v1/weather");
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.source).toBe("forecast");
    expect(data.data.hourly).toHaveLength(1);
  });

  it("returns historical data for far-future date", async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      weddingDate: future.toISOString(),
      venueName: "The Manor",
    });

    // Historical fetches (5 years) — all return null to trigger fallback
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });

    const req = new NextRequest("http://l/api/v1/weather");
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.source).toBe("historical");
    expect(data.data.hourly).toHaveLength(24);
  });

  it("returns 500 on error", async () => {
    mockQueryOne.mockRejectedValue(new Error("db error"));
    const req = new NextRequest("http://l/api/v1/weather");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it("returns historical averages when API succeeds", async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      weddingDate: future.toISOString(),
      venueName: "The Manor",
    });

    const mockHistorical = {
      hourly: {
        temperature_2m: Array(24).fill(85),
        apparent_temperature: Array(24).fill(90),
        relative_humidity_2m: Array(24).fill(60),
        precipitation: Array(24).fill(0),
        weather_code: Array(24).fill(2),
        wind_speed_10m: Array(24).fill(10),
        wind_gusts_10m: Array(24).fill(15),
        cloud_cover: Array(24).fill(40),
      },
      daily: {
        temperature_2m_max: [90],
        temperature_2m_min: [75],
        sunrise: ["06:30"],
        sunset: ["20:15"],
      },
    };

    // 5 historical fetches
    for (let i = 0; i < 5; i++) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistorical),
      });
    }

    const req = new NextRequest("http://l/api/v1/weather");
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.source).toBe("historical");
    expect(data.data.hourly).toHaveLength(24);
    expect(data.data.daily.temperatureMax).toBe(90);
  });
});
