"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | boolean) => void;
}

export default function SettingsBannerSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Announcement Banner</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-ivory/70 text-sm">
            <input
              type="checkbox"
              checked={settings.bannerActive}
              onChange={(e) => onChange("bannerActive", e.target.checked)}
              className="w-4 h-4"
            />
            Banner Active
          </label>
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Banner Color</label>
          <input
            type="text"
            value={settings.bannerColor}
            onChange={(e) => onChange("bannerColor", e.target.value)}
            className="input-celestial w-full"
            placeholder="gold"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Banner Text</label>
          <input
            type="text"
            value={settings.bannerText}
            onChange={(e) => onChange("bannerText", e.target.value)}
            className="input-celestial w-full"
            placeholder="Announcement text..."
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Banner URL</label>
          <input
            type="text"
            value={settings.bannerUrl}
            onChange={(e) => onChange("bannerUrl", e.target.value)}
            className="input-celestial w-full"
            placeholder="Optional link"
          />
        </div>
      </div>
    </section>
  );
}
