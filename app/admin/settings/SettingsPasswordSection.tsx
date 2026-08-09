"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | boolean) => void;
}

export default function SettingsPasswordSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Site Password</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-ivory/70 text-sm">
            <input
              type="checkbox"
              checked={settings.sitePasswordEnabled}
              onChange={(e) => onChange("sitePasswordEnabled", e.target.checked)}
              className="w-4 h-4"
            />
            Password Protection Enabled
          </label>
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Site Password</label>
          <input
            type="text"
            value={settings.sitePassword}
            onChange={(e) => onChange("sitePassword", e.target.value)}
            className="input-celestial w-full"
            placeholder="Guest site password"
          />
        </div>
      </div>
    </section>
  );
}
