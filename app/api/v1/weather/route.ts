import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

/**
 * GET /api/v1/weather
 *
 * Returns weather forecast data for the wedding date at the venue location (Apopka, FL).
 * Uses Open-Meteo (free, no API key required) for both forecast and historical averages.
 *
 * - If the wedding date is within the next 16 days, returns a real hourly forecast.
 * - Otherwise, returns historical climate averages for that day-of-year.
 */

// Apopka, FL coordinates
const VENUE_LAT = 28.6934;
const VENUE_LNG = -81.5323;

interface HourlyForecast {
  hour: string; // "3 PM"
  time: string; // ISO
  temperature: number; // °F
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number; // inches
  weatherCode: number;
  windSpeed: number; // mph
  windGusts: number;
  cloudCover: number;
  uvIndex: number;
}

interface WeatherResponse {
  source: "forecast" | "historical";
  weddingDate: string;
  venueName: string;
  hourly: HourlyForecast[];
  daily: {
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbabilityMax: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
    weatherCode: number;
  } | null;
  lastUpdated: string;
}

// WMO weather code to description mapping
function weatherCodeToDescription(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] || "Unknown";
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings?.weddingDate) {
      return errorResponse("Wedding date not set", 400);
    }

    const weddingDate = new Date(settings.weddingDate);
    const today = new Date();
    const daysUntil = Math.ceil(
      (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dateStr = weddingDate.toISOString().split("T")[0];

    // Cache header — refresh every 30 min for forecast, less for historical
    const cacheSeconds = daysUntil <= 16 ? 1800 : 86400;

    let result: WeatherResponse;

    if (daysUntil <= 16 && daysUntil >= 0) {
      // Real forecast available
      result = await fetchForecast(dateStr, settings.venueName);
    } else {
      // Use historical climate averages
      result = await fetchHistoricalAverages(dateStr, weddingDate, settings.venueName);
    }

    const response = successResponse(result);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${cacheSeconds}, stale-while-revalidate=3600`
    );
    return response;
  } catch (error) {
    console.error("Weather API error:", error);
    return errorResponse("Failed to fetch weather data", 500);
  }
}

async function fetchForecast(
  dateStr: string,
  venueName: string
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: VENUE_LAT.toString(),
    longitude: VENUE_LNG.toString(),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m",
      "cloud_cover",
      "uv_index",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "uv_index_max",
      "weather_code",
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "America/New_York",
    start_date: dateStr,
    end_date: dateStr,
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  const data = await res.json();

  const hourly: HourlyForecast[] = data.hourly.time.map(
    (time: string, i: number) => ({
      time,
      hour: new Date(time).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
        timeZone: "America/New_York",
      }),
      temperature: Math.round(data.hourly.temperature_2m[i]),
      feelsLike: Math.round(data.hourly.apparent_temperature[i]),
      humidity: data.hourly.relative_humidity_2m[i],
      precipitationProbability: data.hourly.precipitation_probability[i],
      precipitation: data.hourly.precipitation[i],
      weatherCode: data.hourly.weather_code[i],
      windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
      windGusts: Math.round(data.hourly.wind_gusts_10m[i]),
      cloudCover: data.hourly.cloud_cover[i],
      uvIndex: data.hourly.uv_index[i],
    })
  );

  return {
    source: "forecast",
    weddingDate: dateStr,
    venueName,
    hourly,
    daily: data.daily
      ? {
          temperatureMax: Math.round(data.daily.temperature_2m_max[0]),
          temperatureMin: Math.round(data.daily.temperature_2m_min[0]),
          precipitationProbabilityMax:
            data.daily.precipitation_probability_max[0],
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],
          uvIndexMax: data.daily.uv_index_max[0],
          weatherCode: data.daily.weather_code[0],
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };
}

async function fetchHistoricalAverages(
  dateStr: string,
  weddingDate: Date,
  venueName: string
): Promise<WeatherResponse> {
  // Fetch last 5 years of data for that day to build averages
  const month = weddingDate.getMonth() + 1;
  const day = weddingDate.getDate();
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);
  const dates = years.map(
    (y) =>
      `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  );

  // Fetch all years in parallel
  const fetches = dates.map(async (d) => {
    const params = new URLSearchParams({
      latitude: VENUE_LAT.toString(),
      longitude: VENUE_LNG.toString(),
      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_gusts_10m",
        "cloud_cover",
      ].join(","),
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
      ].join(","),
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "America/New_York",
      start_date: d,
      end_date: d,
    });

    const res = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`
    );
    if (!res.ok) return null;
    return res.json();
  });

  const results = (await Promise.all(fetches)).filter(Boolean);

  if (results.length === 0) {
    // Fallback generic data
    return buildFallbackHistorical(dateStr, venueName);
  }

  // Average across years for each hour
  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, h) => {
    const temps = results
      .map((r) => r.hourly?.temperature_2m?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const feels = results
      .map((r) => r.hourly?.apparent_temperature?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const humid = results
      .map((r) => r.hourly?.relative_humidity_2m?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const precip = results
      .map((r) => r.hourly?.precipitation?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const winds = results
      .map((r) => r.hourly?.wind_speed_10m?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const gusts = results
      .map((r) => r.hourly?.wind_gusts_10m?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const clouds = results
      .map((r) => r.hourly?.cloud_cover?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];
    const codes = results
      .map((r) => r.hourly?.weather_code?.[h])
      .filter((v: number | undefined) => v !== undefined && v !== null) as number[];

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const rainDays = precip.filter((p) => p > 0.01).length;

    // Build an hour timestamp for the wedding date
    const hourTime = `${dateStr}T${String(h).padStart(2, "0")}:00`;

    return {
      time: hourTime,
      hour: new Date(`${dateStr}T${String(h).padStart(2, "0")}:00:00`).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
        timeZone: "America/New_York",
      }),
      temperature: Math.round(avg(temps)),
      feelsLike: Math.round(avg(feels)),
      humidity: Math.round(avg(humid)),
      precipitationProbability: Math.round(
        (rainDays / results.length) * 100
      ),
      precipitation: Math.round(avg(precip) * 100) / 100,
      weatherCode: codes.length > 0 ? mostCommon(codes) : 0,
      windSpeed: Math.round(avg(winds)),
      windGusts: Math.round(avg(gusts)),
      cloudCover: Math.round(avg(clouds)),
      uvIndex: h >= 10 && h <= 16 ? (h >= 12 && h <= 14 ? 10 : 7) : h >= 8 && h <= 18 ? 4 : 0,
    };
  });

  // Daily summary
  const maxTemps = results
    .map((r) => r.daily?.temperature_2m_max?.[0])
    .filter((v: number | undefined) => v !== undefined) as number[];
  const minTemps = results
    .map((r) => r.daily?.temperature_2m_min?.[0])
    .filter((v: number | undefined) => v !== undefined) as number[];

  const avgArr = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    source: "historical",
    weddingDate: dateStr,
    venueName,
    hourly,
    daily: {
      temperatureMax: Math.round(avgArr(maxTemps)),
      temperatureMin: Math.round(avgArr(minTemps)),
      precipitationProbabilityMax: Math.max(
        ...hourly.map((h) => h.precipitationProbability)
      ),
      sunrise: results[0]?.daily?.sunrise?.[0] ?? "06:30",
      sunset: results[0]?.daily?.sunset?.[0] ?? "20:15",
      uvIndexMax: Math.max(...hourly.map((h) => h.uvIndex)),
      weatherCode: mostCommon(hourly.map((h) => h.weatherCode)),
    },
    lastUpdated: new Date().toISOString(),
  };
}

function buildFallbackHistorical(
  dateStr: string,
  venueName: string
): WeatherResponse {
  // Generic summer averages for Central Florida
  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, h) => {
    const baseTemp =
      h < 6 ? 75 : h < 10 ? 78 + (h - 6) * 2 : h < 15 ? 88 + (h - 10) : h < 20 ? 92 - (h - 15) * 2 : 80 - (h - 20);
    return {
      time: `${dateStr}T${String(h).padStart(2, "0")}:00`,
      hour: `${h === 0 ? 12 : h > 12 ? h - 12 : h} ${h >= 12 ? "PM" : "AM"}`,
      temperature: Math.round(baseTemp),
      feelsLike: Math.round(baseTemp + 5),
      humidity: h < 10 ? 85 : h < 16 ? 65 : 75,
      precipitationProbability: h >= 14 && h <= 18 ? 50 : 15,
      precipitation: 0,
      weatherCode: h >= 14 && h <= 17 ? 80 : h >= 10 ? 2 : 1,
      windSpeed: 8,
      windGusts: 15,
      cloudCover: h >= 13 && h <= 18 ? 60 : 30,
      uvIndex: h >= 10 && h <= 16 ? 10 : h >= 8 && h <= 18 ? 5 : 0,
    };
  });

  return {
    source: "historical",
    weddingDate: dateStr,
    venueName,
    hourly,
    daily: {
      temperatureMax: 93,
      temperatureMin: 75,
      precipitationProbabilityMax: 50,
      sunrise: "06:30",
      sunset: "20:15",
      uvIndexMax: 10,
      weatherCode: 2,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function mostCommon(arr: number[]): number {
  const freq: Record<number, number> = {};
  for (const v of arr) freq[v] = (freq[v] || 0) + 1;
  return Number(
    Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
  );
}

// Export for use by the component
export { weatherCodeToDescription, weatherCodeToEmoji };
