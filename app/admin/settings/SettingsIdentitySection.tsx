"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string) => void;
}

export default function SettingsIdentitySection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Couple & Homepage</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Couple Name</label>
          <input
            type="text"
            value={settings.coupleName}
            onChange={(e) => onChange("coupleName", e.target.value)}
            className="input-celestial w-full"
            placeholder="Jacob & Ashley"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Hashtag</label>
          <input
            type="text"
            value={settings.weddingHashtag}
            onChange={(e) => onChange("weddingHashtag", e.target.value)}
            className="input-celestial w-full"
            placeholder="#ForeverCampbells"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Hero Tagline</label>
          <input
            type="text"
            value={settings.heroTagline}
            onChange={(e) => onChange("heroTagline", e.target.value)}
            className="input-celestial w-full"
            placeholder="We're getting married!"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Hero Tagline (Post-Wedding)</label>
          <input
            type="text"
            value={settings.heroTaglinePostWedding}
            onChange={(e) => onChange("heroTaglinePostWedding", e.target.value)}
            className="input-celestial w-full"
            placeholder="We did it!"
          />
        </div>
      </div>
    </section>
  );
}
