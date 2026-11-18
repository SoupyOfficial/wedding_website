"use client";

import { useState, useCallback } from "react";
import { useAdminFetchRaw } from "@/lib/hooks/use-admin-fetch";
import { AdminPageHeader, Alert, LoadingState } from "@/components/ui";

interface FeatureFlags {
  [key: string]: boolean;
}

interface FlagConfig {
  key: string;
  label: string;
  description: string;
}

const FLAG_GROUPS: { title: string; items: FlagConfig[] }[] = [
  {
    title: "Pages",
    items: [
      { key: "ourStoryPageEnabled", label: "Our Story", description: "Show the Our Story page with your love story content" },
      { key: "galleryPageEnabled", label: "Gallery", description: "Show the Gallery page with your approved photos" },
      { key: "photosOfUsPageEnabled", label: "Share Photos", description: "Show the guest photo upload page" },
    ],
  },
  {
    title: "Features",
    items: [
      { key: "photoUploadEnabled", label: "Photo Uploads", description: "Allow guests to upload photos from the celebration" },
      { key: "guestPhotoSharingEnabled", label: "Photo Sharing", description: "Allow guests to view each others uploaded photos" },
    ],
  },
];

export default function AdminFeaturesPage() {
  const { data: flags, loading, error: fetchError, setData } = useAdminFetchRaw<Record<string, boolean>>("/api/v1/admin/features");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggle = useCallback(async (key: string, enabled: boolean) => {
    setSaving(key);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/admin/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update.");
        return;
      }

      setData(data.data);
      setSuccess(`${key} ${enabled ? "enabled" : "disabled"}.`);
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(null);
    }
  }, [setData]);

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title="Feature Management"
        subtitle="Enable or disable pages and features across your wedding site"
      />

      {error && <Alert type="error" message={error} className="mb-6" />}
      {success && <Alert type="success" message={success} className="mb-6" />}

      <div className="space-y-8">
        {FLAG_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-gold font-serif text-xl mb-4 border-b border-gold/20 pb-2">
              {group.title}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => {
                const isEnabled = flags?.[item.key] ?? false;
                const isSaving = saving === item.key;

                return (
                  <div
                    key={item.key}
                    className="card-celestial flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-ivory font-medium text-sm">
                        {item.label}
                      </h3>
                      <p className="text-ivory/50 text-xs mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key, !isEnabled)}
                      disabled={isSaving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                        isEnabled ? "bg-gold" : "bg-royal/60"
                      } ${isSaving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
