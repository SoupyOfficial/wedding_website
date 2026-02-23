import { query, queryOne, execute, toBool } from "@/lib/db";
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
    await execute("UPDATE FeatureFlag SET enabled = ? WHERE key = ?", [enabled ? 1 : 0, key]);
  } else {
    await execute("INSERT INTO FeatureFlag (key, enabled) VALUES (?, ?)", [key, enabled ? 1 : 0]);
  }
}
