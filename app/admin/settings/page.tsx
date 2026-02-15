"use client";

import { useState, useEffect, useCallback } from "react";

interface Settings {
  id: string;
  coupleName: string;
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string;
  venueAddress: string;
  ceremonyType: string;
  dressCode: string;
  contactEmailJoint: string;
  contactEmailBride: string;
  contactEmailGroom: string;
  weddingHashtag: string;
  sitePassword: string;
  sitePasswordEnabled: boolean;
  rsvpDeadline: string | null;
  rsvpEnabled: boolean;
  heroTagline: string;
  heroTaglinePostWedding: string;
  ourStoryContent: string;
  travelContent: string;
  preWeddingContent: string;
  postWeddingContent: string;
  weatherInfo: string;
  parkingInfo: string;
  childrenPolicy: string;
  faqContent: string;
  photoShareLink: string;
  ogImage: string;
  ogDescription: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTikTok: string;
  notifyOnRsvp: boolean;
  notificationEmail: string;
  bannerText: string;
  bannerUrl: string;
  bannerActive: boolean;
  bannerColor: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/settings");
      const data = await res.json();
      if (data.data) setSettings(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save settings.");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof Settings, value: string | boolean) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  if (loading) {
    return <div className="text-center py-8 text-ivory/40">Loading...</div>;
  }

  if (!settings) {
    return <div className="text-center py-8 text-red-400">Failed to load settings.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Settings</h1>
          <p className="text-ivory/50 text-sm">
            Manage your wedding website settings
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-300 text-sm">
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Couple Info */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Couple Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Couple Name</label>
              <input
                type="text"
                value={settings.coupleName}
                onChange={(e) => updateField("coupleName", e.target.value)}
                className="input-celestial w-full"
                placeholder="Jacob & Ashley"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Hashtag</label>
              <input
                type="text"
                value={settings.weddingHashtag}
                onChange={(e) => updateField("weddingHashtag", e.target.value)}
                className="input-celestial w-full"
                placeholder="#ForeverCampbells"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Contact Email (Joint)</label>
              <input
                type="email"
                value={settings.contactEmailJoint}
                onChange={(e) => updateField("contactEmailJoint", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Contact Email (Bride)</label>
              <input
                type="email"
                value={settings.contactEmailBride}
                onChange={(e) => updateField("contactEmailBride", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Contact Email (Groom)</label>
              <input
                type="email"
                value={settings.contactEmailGroom}
                onChange={(e) => updateField("contactEmailGroom", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Hero Tagline</label>
              <input
                type="text"
                value={settings.heroTagline}
                onChange={(e) => updateField("heroTagline", e.target.value)}
                className="input-celestial w-full"
                placeholder="We're getting married!"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Hero Tagline (Post-Wedding)</label>
              <input
                type="text"
                value={settings.heroTaglinePostWedding}
                onChange={(e) => updateField("heroTaglinePostWedding", e.target.value)}
                className="input-celestial w-full"
                placeholder="We did it!"
              />
            </div>
          </div>
        </section>

        {/* Wedding Details */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Wedding Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Wedding Date</label>
              <input
                type="datetime-local"
                value={settings.weddingDate ? new Date(settings.weddingDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateField("weddingDate", new Date(e.target.value).toISOString())}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Wedding Time</label>
              <input
                type="text"
                value={settings.weddingTime ?? ""}
                onChange={(e) => updateField("weddingTime", e.target.value)}
                className="input-celestial w-full"
                placeholder="4:30 PM"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Venue Name</label>
              <input
                type="text"
                value={settings.venueName}
                onChange={(e) => updateField("venueName", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Ceremony Type</label>
              <input
                type="text"
                value={settings.ceremonyType}
                onChange={(e) => updateField("ceremonyType", e.target.value)}
                className="input-celestial w-full"
                placeholder="Outdoor Ceremony & Indoor Reception"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-ivory/70 text-sm mb-1">Venue Address</label>
              <input
                type="text"
                value={settings.venueAddress}
                onChange={(e) => updateField("venueAddress", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Dress Code</label>
              <input
                type="text"
                value={settings.dressCode}
                onChange={(e) => updateField("dressCode", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Parking Info</label>
              <input
                type="text"
                value={settings.parkingInfo}
                onChange={(e) => updateField("parkingInfo", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Weather Info</label>
              <input
                type="text"
                value={settings.weatherInfo}
                onChange={(e) => updateField("weatherInfo", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Children Policy</label>
              <input
                type="text"
                value={settings.childrenPolicy}
                onChange={(e) => updateField("childrenPolicy", e.target.value)}
                className="input-celestial w-full"
              />
            </div>
          </div>
        </section>

        {/* RSVP Settings */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">RSVP Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input
                  type="checkbox"
                  checked={settings.rsvpEnabled}
                  onChange={(e) => updateField("rsvpEnabled", e.target.checked)}
                  className="w-4 h-4"
                />
                RSVP Enabled
              </label>
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">RSVP Deadline</label>
              <input
                type="date"
                value={settings.rsvpDeadline ? new Date(settings.rsvpDeadline).toISOString().slice(0, 10) : ""}
                onChange={(e) => updateField("rsvpDeadline", new Date(e.target.value).toISOString())}
                className="input-celestial w-full"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input
                  type="checkbox"
                  checked={settings.notifyOnRsvp}
                  onChange={(e) => updateField("notifyOnRsvp", e.target.checked)}
                  className="w-4 h-4"
                />
                Notify on RSVP
              </label>
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Notification Email</label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => updateField("notificationEmail", e.target.value)}
                className="input-celestial w-full"
                placeholder="Email for RSVP notifications"
              />
            </div>
          </div>
        </section>

        {/* Site Password */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Site Password</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input
                  type="checkbox"
                  checked={settings.sitePasswordEnabled}
                  onChange={(e) => updateField("sitePasswordEnabled", e.target.checked)}
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
                onChange={(e) => updateField("sitePassword", e.target.value)}
                className="input-celestial w-full"
                placeholder="Guest site password"
              />
            </div>
          </div>
        </section>

        {/* Announcement Banner */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Announcement Banner</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input
                  type="checkbox"
                  checked={settings.bannerActive}
                  onChange={(e) => updateField("bannerActive", e.target.checked)}
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
                onChange={(e) => updateField("bannerColor", e.target.value)}
                className="input-celestial w-full"
                placeholder="gold"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Banner Text</label>
              <input
                type="text"
                value={settings.bannerText}
                onChange={(e) => updateField("bannerText", e.target.value)}
                className="input-celestial w-full"
                placeholder="Announcement text..."
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Banner URL</label>
              <input
                type="text"
                value={settings.bannerUrl}
                onChange={(e) => updateField("bannerUrl", e.target.value)}
                className="input-celestial w-full"
                placeholder="Optional link"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Our Story Content</label>
              <textarea
                value={settings.ourStoryContent}
                onChange={(e) => updateField("ourStoryContent", e.target.value)}
                className="input-celestial w-full h-32 resize-none"
                placeholder="Your love story..."
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Travel Content</label>
              <textarea
                value={settings.travelContent}
                onChange={(e) => updateField("travelContent", e.target.value)}
                className="input-celestial w-full h-24 resize-none"
                placeholder="Travel information..."
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">FAQ Content</label>
              <textarea
                value={settings.faqContent}
                onChange={(e) => updateField("faqContent", e.target.value)}
                className="input-celestial w-full h-24 resize-none"
                placeholder="Frequently asked questions..."
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Pre-Wedding Content</label>
              <textarea
                value={settings.preWeddingContent}
                onChange={(e) => updateField("preWeddingContent", e.target.value)}
                className="input-celestial w-full h-24 resize-none"
                placeholder="Content to show before the wedding..."
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Post-Wedding Content</label>
              <textarea
                value={settings.postWeddingContent}
                onChange={(e) => updateField("postWeddingContent", e.target.value)}
                className="input-celestial w-full h-24 resize-none"
                placeholder="Content to show after the wedding..."
              />
            </div>
          </div>
        </section>

        {/* SEO & Sharing */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">SEO & Sharing</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-ivory/70 text-sm mb-1">OG Image URL</label>
              <input
                type="text"
                value={settings.ogImage}
                onChange={(e) => updateField("ogImage", e.target.value)}
                className="input-celestial w-full"
                placeholder="URL for social share image"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Photo Share Link</label>
              <input
                type="text"
                value={settings.photoShareLink}
                onChange={(e) => updateField("photoShareLink", e.target.value)}
                className="input-celestial w-full"
                placeholder="Link for guests to share photos"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-ivory/70 text-sm mb-1">OG Description</label>
              <input
                type="text"
                value={settings.ogDescription}
                onChange={(e) => updateField("ogDescription", e.target.value)}
                className="input-celestial w-full"
                placeholder="Description for social media sharing"
              />
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h2 className="text-gold font-serif text-xl mb-4">Social Media</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Instagram</label>
              <input
                type="text"
                value={settings.socialInstagram}
                onChange={(e) => updateField("socialInstagram", e.target.value)}
                className="input-celestial w-full"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">Facebook</label>
              <input
                type="text"
                value={settings.socialFacebook}
                onChange={(e) => updateField("socialFacebook", e.target.value)}
                className="input-celestial w-full"
                placeholder="Facebook page URL"
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-sm mb-1">TikTok</label>
              <input
                type="text"
                value={settings.socialTikTok}
                onChange={(e) => updateField("socialTikTok", e.target.value)}
                className="input-celestial w-full"
                placeholder="@username"
              />
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold px-8 py-3 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
