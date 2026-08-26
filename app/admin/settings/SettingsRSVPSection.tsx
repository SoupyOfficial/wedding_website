"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | boolean | number) => void;
}

export default function SettingsRSVPSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">RSVP</h2>
      <p className="text-ivory/50 text-xs mb-4">
        To enable or disable RSVP, use the <a href="/admin/features" className="text-gold hover:underline">Feature Management</a> page.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">RSVP Deadline</label>
          <input
            type="date"
            value={settings.rsvpDeadline ? new Date(settings.rsvpDeadline).toISOString().slice(0, 10) : ""}
            onChange={(e) => onChange("rsvpDeadline", new Date(e.target.value).toISOString())}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">RSVP Edit Deadline</label>
          <input
            type="date"
            value={settings.rsvpEditDeadline ? new Date(settings.rsvpEditDeadline).toISOString().slice(0, 10) : ""}
            onChange={(e) => onChange("rsvpEditDeadline", new Date(e.target.value).toISOString())}
            className="input-celestial w-full"
          />
          <p className="text-ivory/40 text-xs mt-1">Guests can no longer edit their RSVP after this date. Leave blank to allow edits up to the wedding.</p>
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Notification Email</label>
          <input
            type="email"
            value={settings.notificationEmail}
            onChange={(e) => onChange("notificationEmail", e.target.value)}
            className="input-celestial w-full"
            placeholder="Email for RSVP notifications"
          />
          <p className="text-ivory/40 text-xs mt-1">Coming soon — email notifications are not yet active.</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-ivory/70 text-sm">
            <input
              type="checkbox"
              checked={settings.notifyOnRsvp}
              onChange={(e) => onChange("notifyOnRsvp", e.target.checked)}
              className="w-4 h-4"
            />
            Notify on RSVP
          </label>
          <p className="text-ivory/40 text-xs mt-1">Coming soon — email notifications are not yet active.</p>
        </div>
      </div>
    </section>
  );
}
