"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string) => void;
}

export default function SettingsContentSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Content</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Our Story Content</label>
          <textarea
            value={settings.ourStoryContent}
            onChange={(e) => onChange("ourStoryContent", e.target.value)}
            className="input-celestial w-full h-32 resize-none"
            placeholder="Your love story..."
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Pre-Wedding Content</label>
          <textarea
            value={settings.preWeddingContent}
            onChange={(e) => onChange("preWeddingContent", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="Content to show before the wedding..."
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Post-Wedding Content</label>
          <textarea
            value={settings.postWeddingContent}
            onChange={(e) => onChange("postWeddingContent", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="Content to show after the wedding..."
          />
        </div>
      </div>
    </section>
  );
}
