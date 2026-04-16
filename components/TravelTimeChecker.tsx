"use client";

import { useState, type FormEvent } from "react";
import { keyDestinations, type KeyDestination } from "@/lib/config/travel-content";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const VENUE_ADDRESS = process.env.NEXT_PUBLIC_VENUE_ADDRESS ?? "";

function buildEmbedUrl(origin: string | null): string {
  if (origin) {
    return `https://www.google.com/maps/embed/v1/directions?key=${MAPS_API_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(VENUE_ADDRESS)}&mode=driving`;
  }
  return `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(VENUE_ADDRESS)}`;
}

function buildGoogleMapsUrl(origin: string | null): string {
  if (origin) {
    return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(VENUE_ADDRESS)}`;
  }
  return `https://www.google.com/maps/search/${encodeURIComponent(VENUE_ADDRESS)}`;
}

export default function TravelTimeChecker() {
  const [inputAddress, setInputAddress] = useState("");
  const [activeOrigin, setActiveOrigin] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  if (!MAPS_API_KEY || !VENUE_ADDRESS) return null;

  const checkFrom = (address: string, label?: string, trafficWarning?: string) => {
    setActiveOrigin(address);
    setActiveLabel(label ?? address);
    setWarning(trafficWarning ?? null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputAddress.trim()) {
      checkFrom(inputAddress.trim());
    }
  };

  const handleReset = () => {
    setActiveOrigin(null);
    setActiveLabel(null);
    setWarning(null);
    setInputAddress("");
  };

  return (
    <div>
      {/* Address input */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
        <label htmlFor="travel-address" className="block text-ivory/70 text-sm mb-2 text-center">
          Enter your hotel, Airbnb, or starting address:
        </label>
        <div className="flex gap-2">
          <input
            id="travel-address"
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="e.g. 123 Main St, Orlando, FL"
            className="flex-1 bg-royal/30 border border-gold/20 text-ivory rounded-lg px-4 py-3 text-sm placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
          />
          <button
            type="submit"
            className="btn-gold px-5 py-3 text-sm font-medium whitespace-nowrap"
          >
            Check Route
          </button>
        </div>
      </form>

      {/* Traffic warning alert */}
      {warning && (
        <div className="max-w-2xl mx-auto mb-4 bg-amber-900/30 border border-amber-500/40 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-amber-200 text-sm font-medium mb-1">Traffic Alert</p>
              <p className="text-amber-100/70 text-sm">{warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Travel time reminder when showing directions */}
      {activeOrigin && !warning && (
        <div className="max-w-2xl mx-auto mb-4 bg-royal/30 border border-gold/20 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-ivory/70 text-sm">
              The map below shows estimated travel time for current conditions.
              On the wedding day, <span className="text-gold">add 15–20 minutes</span> as
              a buffer for unexpected traffic.
            </p>
          </div>
        </div>
      )}

      {/* Google Maps embed */}
      <div className="max-w-3xl mx-auto mb-4 rounded-xl overflow-hidden border border-gold/10">
        <iframe
          src={buildEmbedUrl(activeOrigin)}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={activeOrigin ? `Directions to venue from ${activeLabel}` : "Wedding venue location"}
        />
      </div>

      {/* Action links */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <a
          href={buildGoogleMapsUrl(activeOrigin)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold/80 hover:text-gold text-sm transition-colors inline-flex items-center gap-1"
        >
          Open in Google Maps <span aria-hidden="true">↗</span>
        </a>
        {activeOrigin && (
          <button
            onClick={handleReset}
            className="text-ivory/40 hover:text-ivory/60 text-sm transition-colors"
          >
            Reset map
          </button>
        )}
      </div>

      {/* Quick-check destinations */}
      <div>
        <h3 className="text-gold/80 font-serif text-lg text-center mb-4">
          Quick Check from Popular Locations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {keyDestinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => {
                setInputAddress(dest.name);
                checkFrom(dest.address, dest.name, dest.trafficWarning);
              }}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                activeLabel === dest.name
                  ? "bg-gold/15 border-gold/40 shadow-md"
                  : "bg-royal/20 border-gold/10 hover:bg-royal/30 hover:border-gold/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{dest.icon}</span>
                <span className="text-ivory/90 text-xs font-medium leading-tight">
                  {dest.name}
                </span>
              </div>
              <p className="text-gold/70 text-xs font-mono">{dest.estimatedTime}</p>
              {dest.note && (
                <p className="text-ivory/40 text-[10px] mt-1 leading-snug">{dest.note}</p>
              )}
            </button>
          ))}
        </div>
        <p className="text-ivory/30 text-[11px] text-center mt-3 italic">
          Estimated times are for typical conditions. Always check real-time traffic before traveling.
        </p>
      </div>
    </div>
  );
}
