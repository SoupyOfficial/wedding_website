"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | boolean | number) => void;
}

export default function SettingsSEOSection({ settings, onChange }: Props) {
  return (
    <>
      {/* Wedding Party */}
      <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h2 className="text-gold font-serif text-xl mb-4">Wedding Party</h2>
        <div>
          <label className="flex items-center gap-2 text-ivory/70 text-sm">
            <input
              type="checkbox"
              checked={settings.hideUnconfirmedWeddingParty}
              onChange={(e) => onChange("hideUnconfirmedWeddingParty", e.target.checked)}
              className="accent-gold"
            />
            Hide unconfirmed members on public page
          </label>
          <p className="text-ivory/40 text-xs mt-1 ml-5">
            When enabled, only wedding party members marked as &quot;Confirmed&quot; will appear on the public Wedding Party page.
          </p>
        </div>
      </section>

      {/* Reception Raffle */}
      <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h2 className="text-gold font-serif text-xl mb-4">Reception Raffle</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-ivory/70 text-sm mb-1">
              Universal Ticket Raffle Count
            </label>
            <select
              value={settings.raffleTicketCount}
              onChange={(e) => onChange("raffleTicketCount", parseInt(e.target.value, 10))}
              className="input-celestial w-full"
            >
              <option value={0}>Disabled (no raffle)</option>
              <option value={1}>1 ticket</option>
              <option value={2}>2 tickets</option>
              <option value={3}>3 tickets</option>
              <option value={4}>4 tickets</option>
            </select>
            <p className="text-ivory/40 text-xs mt-1">
              Number of Universal theme park tickets to raffle at the reception. Set to 0 to hide the raffle callout.
            </p>
          </div>
          <div>
            <label className="block text-ivory/70 text-sm mb-1">
              Raffle Prize Description
            </label>
            <input
              type="text"
              value={settings.rafflePrize}
              onChange={(e) => onChange("rafflePrize", e.target.value)}
              className="input-celestial w-full"
              placeholder="e.g. 2 Universal Orlando tickets"
            />
            <p className="text-ivory/40 text-xs mt-1">
              Set to -1 to show a non-descript message. Otherwise, the text entered here will be displayed as the prize.
            </p>
          </div>
        </div>
      </section>

      {/* SEO & Social */}
      <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h2 className="text-gold font-serif text-xl mb-4">SEO & Social</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-ivory/70 text-sm mb-1">OG Image URL</label>
            <input
              type="text"
              value={settings.ogImage}
              onChange={(e) => onChange("ogImage", e.target.value)}
              className="input-celestial w-full"
              placeholder="URL for social share image"
            />
            <p className="text-ivory/40 text-xs mt-1">Used when your site is shared on social media. Leave blank for default.</p>
          </div>
          <div>
            <label className="block text-ivory/70 text-sm mb-1">Photo Share Link</label>
            <input
              type="text"
              value={settings.photoShareLink}
              onChange={(e) => onChange("photoShareLink", e.target.value)}
              className="input-celestial w-full"
              placeholder="Link for guests to share photos"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-ivory/70 text-sm mb-1">OG Description</label>
            <input
              type="text"
              value={settings.ogDescription}
              onChange={(e) => onChange("ogDescription", e.target.value)}
              className="input-celestial w-full"
              placeholder="Description for social media sharing"
            />
          </div>
          <div>
            <label className="block text-ivory/70 text-sm mb-1">Instagram</label>
            <input
              type="text"
              value={settings.socialInstagram}
              onChange={(e) => onChange("socialInstagram", e.target.value)}
              className="input-celestial w-full"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-ivory/70 text-sm mb-1">Facebook</label>
            <input
              type="text"
              value={settings.socialFacebook}
              onChange={(e) => onChange("socialFacebook", e.target.value)}
              className="input-celestial w-full"
              placeholder="Facebook page URL"
            />
          </div>
          <div>
            <label className="block text-ivory/70 text-sm mb-1">TikTok</label>
            <input
              type="text"
              value={settings.socialTikTok}
              onChange={(e) => onChange("socialTikTok", e.target.value)}
              className="input-celestial w-full"
              placeholder="@username"
            />
          </div>
        </div>
      </section>
    </>
  );
}
