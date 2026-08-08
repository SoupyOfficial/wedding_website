"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Alert, LoadingState } from "@/components/ui";
import type { Settings } from "./types";
import SettingsIdentitySection from "./SettingsIdentitySection";
import SettingsWeddingSection from "./SettingsWeddingSection";
import SettingsContactSection from "./SettingsContactSection";
import SettingsRSVPSection from "./SettingsRSVPSection";
import SettingsPasswordSection from "./SettingsPasswordSection";
import SettingsBannerSection from "./SettingsBannerSection";
import SettingsContentSection from "./SettingsContentSection";
import SettingsSEOSection from "./SettingsSEOSection";

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

  function updateField(field: keyof Settings, value: string | boolean | number) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!settings) {
    return <Alert type="error" message="Failed to load settings." className="my-8" />;
  }

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Manage your wedding website settings" />

      {success && <Alert type="success" message="Settings saved successfully!" />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSave} className="space-y-8">
        <SettingsIdentitySection settings={settings} onChange={updateField} />
        <SettingsWeddingSection settings={settings} onChange={updateField} />
        <SettingsContactSection settings={settings} onChange={updateField} />
        <SettingsRSVPSection settings={settings} onChange={updateField} />
        <SettingsPasswordSection settings={settings} onChange={updateField} />
        <SettingsBannerSection settings={settings} onChange={updateField} />
        <SettingsContentSection settings={settings} onChange={updateField} />
        <SettingsSEOSection settings={settings} onChange={updateField} />

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
