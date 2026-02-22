"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────

interface HourlyForecast {
  hour: string;
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windGusts: number;
  cloudCover: number;
  uvIndex: number;
}

interface DailySummary {
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbabilityMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  weatherCode: number;
}

interface WeatherData {
  source: "forecast" | "historical";
  weddingDate: string;
  venueName: string;
  hourly: HourlyForecast[];
  daily: DailySummary | null;
  lastUpdated: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  icon?: string;
  sortOrder: number;
}

// ─── Helpers ─────────────────────────────────────────────

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
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Severe thunderstorm",
  };
  return map[code] || "Partly cloudy";
}

function uvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-400" };
  if (uv <= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  if (uv <= 10) return { label: "Very High", color: "text-red-400" };
  return { label: "Extreme", color: "text-purple-400" };
}

/**
 * Attempt to parse event time strings like "4:30 PM", "4PM", "16:00" to a 24h hour number.
 */
function parseTimeToHour(timeStr: string): number | null {
  // Handle "4:30 PM", "4 PM", "4PM"
  const match12 = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h;
  }
  // Handle "16:00"
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) return parseInt(match24[1], 10);
  return null;
}

// ─── Component ───────────────────────────────────────────

export default function WeatherForecast({
  weddingDate,
  timelineEvents,
}: {
  weddingDate: string | null;
  timelineEvents: TimelineEvent[];
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const fetchWeather = useCallback(
    async (isRefresh = false) => {
      if (!weddingDate) {
        setLoading(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetch("/api/v1/weather");
        const data = await res.json();
        if (data.success) {
          setWeather(data.data);
          setError(null);
        } else {
          setError(data.error || "Failed to load weather");
        }
      } catch {
        setError("Could not connect to weather service");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [weddingDate]
  );

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => fetchWeather(true), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (!weddingDate) return null;

  // Calculate days until wedding
  const daysUntil = Math.ceil(
    (new Date(weddingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="heading-gold text-3xl text-center mb-4">
          🌤️ Wedding Day Weather
        </h2>
        <div className="card-celestial text-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="text-4xl">🌤️</div>
            <div className="h-4 bg-gold/20 rounded w-48" />
            <div className="h-3 bg-gold/10 rounded w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="heading-gold text-3xl text-center mb-4">
          🌤️ Wedding Day Weather
        </h2>
        <div className="card-celestial text-center py-8">
          <p className="text-ivory/50 text-sm">{error || "Weather data unavailable"}</p>
          <button
            onClick={() => fetchWeather(true)}
            className="btn-outline text-sm px-4 py-2 mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter to relevant hours (6 AM – 11 PM)
  const relevantHours = weather.hourly.filter((_, i) => i >= 6 && i <= 23);

  // Map events to hours
  const eventHours: { event: TimelineEvent; hour: number }[] = timelineEvents
    .map((e) => ({ event: e, hour: parseTimeToHour(e.time) }))
    .filter((e): e is { event: TimelineEvent; hour: number } => e.hour !== null);

  const selectedData = selectedHour !== null ? weather.hourly[selectedHour] : null;

  return (
    <div className="max-w-5xl mx-auto mb-16">
      <h2 className="heading-gold text-3xl text-center mb-2">
        🌤️ Wedding Day Weather
      </h2>
      <p className="text-ivory/50 text-center text-sm mb-2">
        {weather.venueName} · {new Date(weather.weddingDate + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      {/* Source badge */}
      <div className="flex justify-center gap-2 mb-6">
        {weather.source === "forecast" ? (
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live Forecast
          </span>
        ) : (
          <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
            📊 Historical Averages ({daysUntil} days away)
          </span>
        )}
        {refreshing && (
          <span className="text-xs text-ivory/40 flex items-center gap-1">
            <span className="animate-spin">↻</span> Updating…
          </span>
        )}
      </div>

      {/* Florida volatility warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 max-w-3xl mx-auto mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-amber-400 font-serif font-bold text-sm mb-1">
              Florida Weather Is Unpredictable!
            </p>
            <p className="text-ivory/60 text-xs leading-relaxed">
              Central Florida is known for its rapidly changing weather — sunny skies can turn to
              afternoon thunderstorms in minutes, and then clear right back up. Even the most accurate
              forecasts can shift significantly day-to-day.{" "}
              <span className="text-amber-400/80 font-semibold">
                We recommend planning for all possibilities:
              </span>{" "}
              bring sunscreen, a small umbrella or rain jacket, and stay hydrated. The ceremony is
              outdoors, but the reception is indoors and fully air-conditioned — so rain or shine,
              the party goes on! 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Daily Overview */}
      {weather.daily && (
        <div className="card-celestial mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">
                {weatherCodeToEmoji(weather.daily.weatherCode)}
              </span>
              <div>
                <p className="text-gold font-serif text-2xl">
                  {weather.daily.temperatureMax}°F{" "}
                  <span className="text-ivory/40 text-base">
                    / {weather.daily.temperatureMin}°F
                  </span>
                </p>
                <p className="text-ivory/60 text-sm">
                  {weatherCodeToDescription(weather.daily.weatherCode)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-ivory/40 text-xs">Rain Chance</p>
                <p className={`font-bold text-lg ${weather.daily.precipitationProbabilityMax > 50 ? "text-blue-400" : "text-gold"}`}>
                  {weather.daily.precipitationProbabilityMax}%
                </p>
              </div>
              <div>
                <p className="text-ivory/40 text-xs">UV Index</p>
                <p className={`font-bold text-lg ${uvLabel(weather.daily.uvIndexMax).color}`}>
                  {weather.daily.uvIndexMax}
                  <span className="text-xs ml-1">
                    ({uvLabel(weather.daily.uvIndexMax).label})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-ivory/40 text-xs">🌅 Sunrise</p>
                <p className="text-gold font-semibold">
                  {formatTimeStr(weather.daily.sunrise)}
                </p>
              </div>
              <div>
                <p className="text-ivory/40 text-xs">🌇 Sunset</p>
                <p className="text-gold font-semibold">
                  {formatTimeStr(weather.daily.sunset)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event-based weather timeline */}
      {eventHours.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gold font-serif text-lg text-center mb-3">
            Weather During Your Events
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventHours.map(({ event, hour }) => {
              const h = weather.hourly[hour];
              if (!h) return null;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedHour(hour)}
                  className={`card-celestial text-left transition-all hover:border-gold/40 cursor-pointer ${
                    selectedHour === hour ? "border-gold/60 bg-gold/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {event.icon && <span className="text-lg">{event.icon}</span>}
                      <span className="text-gold font-serif text-sm font-bold">
                        {event.title}
                      </span>
                    </div>
                    <span className="text-3xl">{weatherCodeToEmoji(h.weatherCode)}</span>
                  </div>
                  <p className="text-ivory/50 text-xs mb-2">{event.time}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-gold font-bold">{h.temperature}°F</span>
                    <span className="text-ivory/50">
                      Feels {h.feelsLike}°F
                    </span>
                    <span className={h.precipitationProbability > 40 ? "text-blue-400" : "text-ivory/50"}>
                      🌧 {h.precipitationProbability}%
                    </span>
                    <span className="text-ivory/50">
                      💨 {h.windSpeed} mph
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hourly temperature chart */}
      <div className="card-celestial mb-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold font-serif text-lg">Hourly Forecast</h3>
          <button
            onClick={() => fetchWeather(true)}
            disabled={refreshing}
            className="text-xs text-ivory/40 hover:text-gold transition-colors disabled:opacity-50"
          >
            {refreshing ? "Updating…" : "↻ Refresh"}
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-1 min-w-max">
            {relevantHours.map((h, i) => {
              const actualHour = i + 6;
              const isEvent = eventHours.some((e) => e.hour === actualHour);
              const maxTemp = Math.max(...relevantHours.map((r) => r.temperature));
              const minTemp = Math.min(...relevantHours.map((r) => r.temperature));
              const range = maxTemp - minTemp || 1;
              const barHeight = ((h.temperature - minTemp) / range) * 60 + 20;

              return (
                <button
                  key={actualHour}
                  onClick={() => setSelectedHour(actualHour)}
                  className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg transition-all cursor-pointer min-w-[3rem] ${
                    selectedHour === actualHour
                      ? "bg-gold/15 border border-gold/40"
                      : isEvent
                      ? "bg-gold/5 border border-gold/20"
                      : "hover:bg-royal/30 border border-transparent"
                  }`}
                >
                  <span className="text-[10px] text-ivory/40">{h.hour}</span>
                  <span className="text-lg">{weatherCodeToEmoji(h.weatherCode)}</span>
                  <div className="relative w-4 flex items-end" style={{ height: 80 }}>
                    <div
                      className={`w-full rounded-t transition-all ${
                        h.precipitationProbability > 50
                          ? "bg-blue-400/60"
                          : h.temperature >= 90
                          ? "bg-orange-400/60"
                          : "bg-gold/40"
                      }`}
                      style={{ height: barHeight }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gold">{h.temperature}°</span>
                  {h.precipitationProbability > 0 && (
                    <span
                      className={`text-[10px] ${
                        h.precipitationProbability > 50 ? "text-blue-400" : "text-ivory/40"
                      }`}
                    >
                      {h.precipitationProbability}%
                    </span>
                  )}
                  {isEvent && (
                    <span className="text-[8px] bg-gold/20 text-gold px-1 rounded-full">
                      EVENT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected hour detail */}
      {selectedData && (
        <div className="card-celestial border-gold/30 mb-6 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gold font-serif text-lg">
              {selectedData.hour} — Details
            </h3>
            <button
              onClick={() => setSelectedHour(null)}
              className="text-ivory/40 hover:text-ivory text-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-ivory/40 text-xs">Temperature</p>
              <p className="text-gold font-bold text-xl">{selectedData.temperature}°F</p>
              <p className="text-ivory/40 text-xs">Feels like {selectedData.feelsLike}°F</p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Conditions</p>
              <p className="text-2xl">{weatherCodeToEmoji(selectedData.weatherCode)}</p>
              <p className="text-ivory/60 text-xs">
                {weatherCodeToDescription(selectedData.weatherCode)}
              </p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Rain Chance</p>
              <p
                className={`font-bold text-xl ${
                  selectedData.precipitationProbability > 50 ? "text-blue-400" : "text-gold"
                }`}
              >
                {selectedData.precipitationProbability}%
              </p>
              {selectedData.precipitation > 0 && (
                <p className="text-ivory/40 text-xs">
                  {selectedData.precipitation}" expected
                </p>
              )}
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Humidity</p>
              <p className="text-gold font-bold text-xl">{selectedData.humidity}%</p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Wind</p>
              <p className="text-gold font-bold text-xl">{selectedData.windSpeed} mph</p>
              <p className="text-ivory/40 text-xs">
                Gusts up to {selectedData.windGusts} mph
              </p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Cloud Cover</p>
              <p className="text-gold font-bold text-xl">{selectedData.cloudCover}%</p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">UV Index</p>
              <p className={`font-bold text-xl ${uvLabel(selectedData.uvIndex).color}`}>
                {selectedData.uvIndex}
              </p>
              <p className={`text-xs ${uvLabel(selectedData.uvIndex).color}`}>
                {uvLabel(selectedData.uvIndex).label}
              </p>
            </div>
            <div>
              <p className="text-ivory/40 text-xs">Condition</p>
              <p className="text-4xl">{weatherCodeToEmoji(selectedData.weatherCode)}</p>
            </div>
          </div>
          {/* Event match callout */}
          {eventHours
            .filter((e) => e.hour === selectedHour)
            .map(({ event }) => (
              <div
                key={event.id}
                className="mt-4 bg-gold/10 border border-gold/20 rounded-lg p-3 text-center"
              >
                <p className="text-gold text-sm">
                  {event.icon} <span className="font-serif font-bold">{event.title}</span>{" "}
                  is scheduled at this time
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Preparation tips based on forecast */}
      <div className="card-celestial">
        <h3 className="text-gold font-serif text-lg mb-3">
          🎒 What to Bring — Based on the Forecast
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <PrepTip
            emoji="🧴"
            title="Sunscreen"
            show={
              weather.daily ? weather.daily.uvIndexMax >= 5 : true
            }
            desc={
              weather.daily && weather.daily.uvIndexMax >= 8
                ? "UV will be very high — SPF 50+ recommended!"
                : "UV will be moderate — SPF 30+ recommended."
            }
          />
          <PrepTip
            emoji="☂️"
            title="Umbrella"
            show={
              weather.daily
                ? weather.daily.precipitationProbabilityMax > 20
                : true
            }
            desc={
              weather.daily && weather.daily.precipitationProbabilityMax > 50
                ? "Good chance of rain — a compact umbrella is a must."
                : "Small chance of showers — better safe than sorry!"
            }
          />
          <PrepTip
            emoji="💧"
            title="Stay Hydrated"
            show={true}
            desc="Florida heat + humidity can sneak up on you. Drink plenty of water!"
          />
          <PrepTip
            emoji="🕶️"
            title="Sunglasses"
            show={weather.daily ? weather.daily.weatherCode <= 2 : true}
            desc="Bright sunshine expected — protect your eyes!"
          />
        </div>
      </div>

      {/* Last updated */}
      <p className="text-center text-ivory/30 text-xs mt-4">
        {weather.source === "forecast" ? "Live forecast" : "Based on historical averages"} ·
        Last updated:{" "}
        {new Date(weather.lastUpdated).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })}{" "}
        ET
        {weather.source === "forecast" && " · Auto-refreshes every 30 min"}
      </p>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function PrepTip({
  emoji,
  title,
  desc,
  show,
}: {
  emoji: string;
  title: string;
  desc: string;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <div className="bg-royal/20 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <p className="text-gold font-semibold text-sm">{title}</p>
      <p className="text-ivory/50 text-xs mt-1">{desc}</p>
    </div>
  );
}

function formatTimeStr(timeStr: string): string {
  try {
    // Could be ISO or just "HH:MM"
    if (timeStr.includes("T")) {
      return new Date(timeStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      });
    }
    // Parse "06:30" → "6:30 AM"
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  } catch {
    return timeStr;
  }
}
