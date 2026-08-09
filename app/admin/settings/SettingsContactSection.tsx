"use client";

import type { Settings } from "./types";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string) => void;
}

export default function SettingsContactSection({ settings, onChange }: Props) {
  return (
    <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
      <h2 className="text-gold font-serif text-xl mb-4">Contact Emails</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Joint Email</label>
          <input
            type="email"
            value={settings.contactEmailJoint}
            onChange={(e) => onChange("contactEmailJoint", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Bride Email</label>
          <input
            type="email"
            value={settings.contactEmailBride}
            onChange={(e) => onChange("contactEmailBride", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Groom Email</label>
          <input
            type="email"
            value={settings.contactEmailGroom}
            onChange={(e) => onChange("contactEmailGroom", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
      </div>

      <h2 className="text-gold font-serif text-xl mb-4 mt-6">Contact Phone Numbers</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Ashley&apos;s Phone</label>
          <input
            type="tel"
            value={settings.contactPhoneAshley}
            onChange={(e) => onChange("contactPhoneAshley", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Jacob&apos;s Phone</label>
          <input
            type="tel"
            value={settings.contactPhoneJacob}
            onChange={(e) => onChange("contactPhoneJacob", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Mary Lorraine&apos;s Phone</label>
          <input
            type="tel"
            value={settings.contactPhoneMaryLorraine}
            onChange={(e) => onChange("contactPhoneMaryLorraine", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
        <div>
          <label className="block text-ivory/70 text-sm mb-1">Mollie&apos;s Phone</label>
          <input
            type="tel"
            value={settings.contactPhoneMollie}
            onChange={(e) => onChange("contactPhoneMollie", e.target.value)}
            className="input-celestial w-full"
          />
        </div>
      </div>
    </section>
  );
}
