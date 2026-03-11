"use client";

import { useState, useCallback } from "react";
import { useAdminFetch } from "@/lib/hooks/use-admin-fetch";
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
      { key: "eventDetailsPageEnabled", label: "Event Details", description: "Show the Event Details page with timeline and schedule" },
      { key: "travelPageEnabled", label: "Travel & Stay", description: "Show the Travel page with hotel and venue info" },
      { key: "weddingPartyPageEnabled", label: "Wedding Party", description: "Show the Wedding Party page introducing your bridal party" },
      { key: "entertainmentPageEnabled", label: "Entertainment", description: "Show the Entertainment page with activities" },
      { key: "musicPageEnabled", label: "Song Requests", description: "Show the Song Requests page for guest music suggestions" },
      { key: "galleryPageEnabled", label: "Gallery", description: "Show the Gallery page with your curated photos" },
      { key: "photosOfUsPageEnabled", label: "Photos of Us", description: "Show the guest photo upload page" },
      { key: "registryPageEnabled", label: "Registry", description: "Show the Registry page with gift registry links" },
      { key: "faqPageEnabled", label: "FAQ", description: "Show the FAQ page with common questions" },
      { key: "contactPageEnabled", label: "Contact", description: "Show the Contact page for guest inquiries" },
    ],
  },
  {
    title: "Features",
    items: [
      { key: "rsvpEnabled", label: "RSVP", description: "Allow guests to RSVP and manage their attendance" },
      { key: "guestBookEnabled", label: "Guest Book", description: "Allow guests to sign the guest book" },
      { key: "songRequestsEnabled", label: "Song Requests", description: "Allow guests to submit music requests for the reception" },
      { key: "photoUploadEnabled", label: "Photo Uploads", description: "Allow guests to upload photos from the event" },
      { key: "guestPhotoSharingEnabled", label: "Photo Sharing", description: "Allow guests to view each others uploaded photos" },
      { key: "liveGuestCountEnabled", label: "Live Guest Count", description: "Show real-time attendance count on the homepage" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { key: "registrySyncEnabled", label: "Registry Sync", description: "Enable automatic syncing with external registry providers" },
      { key: "massEmailEnabled", label: "Mass Email", description: "Enable bulk email sending to guest list" },
    ],
  },
];

export default function AdminFeaturesPage() {
  const { data: flags, loading, error: fetchError, setData } = useAdminFetch<Record<string, boolean>>("/api/v1/admin/features");
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
