import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import WeatherForecast from "@/components/WeatherForecast";

function makeHourly(overrides: Partial<Record<string, number>> = {}) {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`,
    time: `${String(i).padStart(2, "0")}:00`,
    temperature: 78 + (overrides.temperature ?? 0),
    feelsLike: 82 + (overrides.feelsLike ?? 0),
    humidity: 60,
    precipitationProbability: overrides.precipPct ?? 20,
    precipitation: overrides.precip ?? 0,
    weatherCode: overrides.weatherCode ?? 0,
    windSpeed: 8,
    windGusts: 15,
    cloudCover: 30,
    uvIndex: overrides.uvIndex ?? 6,
  }));
}

function makeWeatherData(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      source: "forecast",
      weddingDate: "2025-10-04",
      venueName: "The Highland Manor",
      hourly: makeHourly(overrides),
      daily: {
        temperatureMax: 88,
        temperatureMin: 72,
        precipitationProbabilityMax: overrides.dailyPrecipMax ?? 30,
        sunrise: "07:15",
        sunset: "19:05",
        uvIndexMax: overrides.dailyUvMax ?? 8,
        weatherCode: overrides.dailyWeatherCode ?? 1,
      },
      lastUpdated: new Date().toISOString(),
    },
  };
}

const timelineEvents = [
  { id: "1", title: "Ceremony", time: "4:30 PM", icon: "💍", sortOrder: 1 },
  { id: "2", title: "Reception", time: "6:00 PM", icon: "🎉", sortOrder: 2 },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WeatherForecast", () => {
  it("returns null when weddingDate is null", () => {
    const { container } = render(
      <WeatherForecast weddingDate={null} timelineEvents={[]} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    expect(screen.getByText("Wedding Day Weather", { exact: false })).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("Could not connect to weather service")).toBeInTheDocument();
    });
  });

  it("shows error from API response", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: "No data" }),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("renders full forecast with daily overview", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={timelineEvents} />
    );
    await waitFor(() => {
      expect(screen.getByText("88°F", { exact: false })).toBeInTheDocument();
    });
    // Daily overview
    expect(screen.getByText("Live Forecast")).toBeInTheDocument();
    // Prep tips
    expect(screen.getByText("Sunscreen")).toBeInTheDocument();
    expect(screen.getByText("Stay Hydrated")).toBeInTheDocument();
  });

  it("renders historical source badge", async () => {
    const data = makeWeatherData();
    (data.data as Record<string, unknown>).source = "historical";
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(data),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText(/Historical Averages/)).toBeInTheDocument();
    });
  });

  it("renders event timeline weather cards", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={timelineEvents} />
    );
    await waitFor(() => {
      expect(screen.getByText("Ceremony")).toBeInTheDocument();
      expect(screen.getByText("Reception")).toBeInTheDocument();
    });
    expect(screen.getByText("Weather During Your Events")).toBeInTheDocument();
  });

  it("selecting an event hour shows detail panel", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={timelineEvents} />
    );
    await waitFor(() => screen.getByText("Ceremony"));
    // Click the ceremony card (hour 16)
    fireEvent.click(screen.getByText("Ceremony"));
    await waitFor(() => {
      expect(screen.getByText(/Details/)).toBeInTheDocument();
    });
  });

  it("clicking close button hides detail panel", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={timelineEvents} />
    );
    await waitFor(() => screen.getByText("Ceremony"));
    fireEvent.click(screen.getByText("Ceremony"));
    await waitFor(() => screen.getByText("✕"));
    fireEvent.click(screen.getByText("✕"));
    await waitFor(() => {
      expect(screen.queryByText(/— Details/)).not.toBeInTheDocument();
    });
  });

  it("refresh button triggers re-fetch", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => screen.getByText("88°F", { exact: false }));
    fireEvent.click(screen.getByText(/Refresh/));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it("shows umbrella tip when rain chance > 20%", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ dailyPrecipMax: 55 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("Umbrella")).toBeInTheDocument();
    });
  });

  it("shows sunglasses tip for clear weather", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ dailyWeatherCode: 0 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("Sunglasses")).toBeInTheDocument();
    });
  });

  it("hides sunglasses tip when overcast", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ dailyWeatherCode: 3 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => screen.getByText("88°F", { exact: false }));
    expect(screen.queryByText("Sunglasses")).not.toBeInTheDocument();
  });

  it("renders without daily data (null)", async () => {
    const data = makeWeatherData();
    (data.data as Record<string, unknown>).daily = null;
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(data),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      // Should still render hourly and prep tips without crashing
      expect(screen.getByText("Hourly Forecast")).toBeInTheDocument();
    });
  });

  it("shows last updated time", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    });
  });

  it("handles events with unparseable times", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    const badEvents = [
      { id: "1", title: "Ceremony", time: "TBD", icon: "💍", sortOrder: 1 },
    ];
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={badEvents} />
    );
    await waitFor(() => screen.getByText("88°F", { exact: false }));
    // "Weather During Your Events" should not appear since time can't be parsed
    expect(screen.queryByText("Weather During Your Events")).not.toBeInTheDocument();
  });

  it("handles 24h time format in events", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    const events24 = [
      { id: "1", title: "Cocktails", time: "16:00", icon: "🍸", sortOrder: 1 },
    ];
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={events24} />
    );
    await waitFor(() => {
      expect(screen.getByText("Cocktails")).toBeInTheDocument();
    });
  });

  it("renders weather codes as correct emojis", async () => {
    // thunderstorm code 95
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ weatherCode: 95, dailyWeatherCode: 95 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("Thunderstorm")).toBeInTheDocument();
    });
  });

  it("shows high UV warning in detail panel", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ dailyUvMax: 11 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText(/Extreme/)).toBeInTheDocument();
    });
  });

  it("formats sunrise/sunset times", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => {
      expect(screen.getByText("7:15 AM")).toBeInTheDocument();
      expect(screen.getByText("7:05 PM")).toBeInTheDocument();
    });
  });

  it("retries on error via retry button", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce({
        json: () => Promise.resolve(makeWeatherData()),
      });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => screen.getByText("Retry"));
    fireEvent.click(screen.getByText("Retry"));
    await waitFor(() => {
      expect(screen.getByText("88°F", { exact: false })).toBeInTheDocument();
    });
  });

  it("clicking hourly bar shows detail", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData()),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={[]} />
    );
    await waitFor(() => screen.getByText("Hourly Forecast"));
    // Hourly bars are buttons with temperature text; click first one visible
    const bars = screen.getAllByText("78°");
    fireEvent.click(bars[0]);
    await waitFor(() => {
      expect(screen.getByText(/Details/)).toBeInTheDocument();
    });
  });

  it("shows precipitation details in selected hour panel", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(makeWeatherData({ precipPct: 80 })),
    });
    render(
      <WeatherForecast weddingDate="2025-10-04" timelineEvents={timelineEvents} />
    );
    await waitFor(() => screen.getByText("Ceremony"));
    fireEvent.click(screen.getByText("Ceremony"));
    await waitFor(() => {
      // Detail panel shows temperature, humidity, wind etc.
      expect(screen.getByText("Humidity")).toBeInTheDocument();
      expect(screen.getByText(/Wind/)).toBeInTheDocument();
    });
  });
});
