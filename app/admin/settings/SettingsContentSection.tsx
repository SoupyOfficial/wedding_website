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
          <label className="block text-ivory/70 text-sm mb-1">Travel Content</label>
          <textarea
            value={settings.travelContent}
            onChange={(e) => onChange("travelContent", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="Travel information..."
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">FAQ Page Intro</label>
          <textarea
            value={settings.faqContent}
            onChange={(e) => onChange("faqContent", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="Introductory text shown above the FAQ list..."
          />
          <p className="text-ivory/40 text-xs mt-1">Shown above the individual FAQ entries managed on the <a href="/admin/faqs" className="text-gold hover:underline">FAQs</a> page.</p>
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
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Registry Note</label>
          <textarea
            value={settings.registryNote}
            onChange={(e) => onChange("registryNote", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="A personal note shown on the registry page..."
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Entertainment Note</label>
          <textarea
            value={settings.entertainmentNote}
            onChange={(e) => onChange("entertainmentNote", e.target.value)}
            className="input-celestial w-full h-24 resize-none"
            placeholder="Description for the entertainment section..."
          />
        </div>
      </div>
    </section>
  );
}
