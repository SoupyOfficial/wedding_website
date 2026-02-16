"use client";

import { useState, useEffect } from "react";

export interface PublicSettings {
  coupleName: string;
  weddingDate: string;
  weddingHashtag: string;
  venueName: string;
  venueAddress: string;
  contactEmailJoint: string;
  contactEmailBride: string;
  contactEmailGroom: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTikTok: string;
  heroTagline: string;
  ceremonyType: string;
  registryNote: string;
  entertainmentNote: string;
}

/**
 * Hook for fetching public site settings on client components.
 * Falls back to defaults while loading.
 */
export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
