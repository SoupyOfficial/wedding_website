"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | boolean | number) => void;
}

export default function SettingsWeddingSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Wedding Details</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Wedding Date</label>
          <input
            type="datetime-local"
            value={settings.weddingDate ? new Date(settings.weddingDate).toISOString().slice(0, 16) : ""}
            onChange={(e) => onChange("weddingDate", new Date(e.target.value).toISOString())}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Wedding Time</label>
          <input
            type="text"
            value={settings.weddingTime ?? ""}
            onChange={(e) => onChange("weddingTime", e.target.value)}
            className="input-celestial w-full"
            placeholder="4:30 PM"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Venue Name</label>
          <input
            type="text"
            value={settings.venueName}
            onChange={(e) => onChange("venueName", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Ceremony Type</label>
          <input
            type="text"
            value={settings.ceremonyType}
            onChange={(e) => onChange("ceremonyType", e.target.value)}
            className="input-celestial w-full"
            placeholder="Outdoor Ceremony & Indoor Reception"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-ivory/70 text-sm mb-1">Venue Address</label>
          <input
            type="text"
            value={settings.venueAddress}
            onChange={(e) => onChange("venueAddress", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Dress Code</label>
          <input
            type="text"
            value={settings.dressCode}
            onChange={(e) => onChange("dressCode", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Dress Code Images (JSON array of URLs)</label>
          <textarea
            value={settings.dressCodeImages}
            onChange={(e) => onChange("dressCodeImages", e.target.value)}
            className="input-celestial w-full min-h-[80px] font-mono text-xs"
            rows={3}
            placeholder='["https://example.com/formal-attire.jpg", "https://example.com/semi-formal.jpg"]'
          />
          <p className="text-ivory/40 text-xs mt-1">Optional. Paste a JSON array of image URLs to show visual dress code examples.</p>
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Parking Info</label>
          <input
            type="text"
            value={settings.parkingInfo}
            onChange={(e) => onChange("parkingInfo", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Weather Info</label>
          <input
            type="text"
            value={settings.weatherInfo}
            onChange={(e) => onChange("weatherInfo", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Children Policy</label>
          <input
            type="text"
            value={settings.childrenPolicy}
            onChange={(e) => onChange("childrenPolicy", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Unplugged Ceremony Notice</label>
          <textarea
            value={settings.unpluggedCeremonyNotice}
            onChange={(e) => onChange("unpluggedCeremonyNotice", e.target.value)}
            className="input-celestial w-full min-h-[80px]"
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}
