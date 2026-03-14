import { query, queryOne, execute, toBool, generateId, now } from "@/lib/db";
import type { FeatureFlag } from "@/lib/db-types";

export interface FeatureFlags {
  rsvpEnabled: boolean;
  guestBookEnabled: boolean;
  photoUploadEnabled: boolean;
  registrySyncEnabled: boolean;
  songRequestsEnabled: boolean;
  entertainmentPageEnabled: boolean;
  guestPhotoSharingEnabled: boolean;
  liveGuestCountEnabled: boolean;
  massEmailEnabled: boolean;
  ourStoryPageEnabled: boolean;
  eventDetailsPageEnabled: boolean;
  travelPageEnabled: boolean;
  weddingPartyPageEnabled: boolean;
  galleryPageEnabled: boolean;
  registryPageEnabled: boolean;
  faqPageEnabled: boolean;
  contactPageEnabled: boolean;
  musicPageEnabled: boolean;
  photosOfUsPageEnabled: boolean;
  [key: string]: boolean;
}

const defaultFlags: FeatureFlags = {
  rsvpEnabled: true,
  guestBookEnabled: true,
  photoUploadEnabled: false,
  registrySyncEnabled: false,
  songRequestsEnabled: true,
  entertainmentPageEnabled: true,
  guestPhotoSharingEnabled: false,
  liveGuestCountEnabled: false,
  massEmailEnabled: true,
  ourStoryPageEnabled: true,
  eventDetailsPageEnabled: true,
  travelPageEnabled: true,
  weddingPartyPageEnabled: true,
  galleryPageEnabled: true,
  registryPageEnabled: true,
  faqPageEnabled: true,
  contactPageEnabled: true,
  musicPageEnabled: true,
  photosOfUsPageEnabled: true,
};

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const flags = await query<FeatureFlag>("SELECT * FROM FeatureFlag");
    const result = { ...defaultFlags };

    for (const flag of flags) {
      result[flag.key] = flag.enabled === 1 || flag.enabled === true;
    }

    return result;
  } catch {
    return defaultFlags;
  }
}

export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const flag = await queryOne<FeatureFlag>("SELECT * FROM FeatureFlag WHERE key = ?", [key]);
    if (!flag) return defaultFlags[key] ?? false;
    return flag.enabled === 1 || flag.enabled === true;
  } catch {
    return defaultFlags[key] ?? false;
  }
}

export async function setFeatureFlag(
  key: string,
  enabled: boolean
): Promise<void> {
  const existing = await queryOne<FeatureFlag>("SELECT * FROM FeatureFlag WHERE key = ?", [key]);
  if (existing) {
    await execute("UPDATE FeatureFlag SET enabled = ?, updatedAt = ? WHERE key = ?", [enabled ? 1 : 0, now(), key]);
  } else {
    await execute("INSERT INTO FeatureFlag (id, key, enabled, updatedAt) VALUES (?, ?, ?, ?)", [generateId(), key, enabled ? 1 : 0, now()]);
  }
}
