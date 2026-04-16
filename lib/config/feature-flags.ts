import { query, queryOne, execute, generateId, now } from "@/lib/db";
import type { FeatureFlag } from "@/lib/db-types";
import defaults from "./feature-flag-defaults.json";

/** Derived from feature-flag-defaults.json — add new flags there (OCP). */
export type FeatureFlags = typeof defaults;

export type FeatureFlagKey = keyof FeatureFlags;

const defaultFlags: FeatureFlags = defaults;

/** Runtime guard for untrusted input (e.g., API request bodies). */
export function isFeatureFlagKey(key: string): key is FeatureFlagKey {
  return key in defaultFlags;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const flags = await query<FeatureFlag>("SELECT * FROM FeatureFlag");
    const result = { ...defaultFlags };

    for (const flag of flags) {
      if (flag.key in result) {
        (result as Record<string, boolean>)[flag.key] =
          flag.enabled === 1 || flag.enabled === true;
      }
    }

    return result;
  } catch {
    return { ...defaultFlags };
  }
}

export async function getFeatureFlag<K extends FeatureFlagKey>(
  key: K
): Promise<boolean> {
  try {
    const flag = await queryOne<FeatureFlag>(
      "SELECT * FROM FeatureFlag WHERE key = ?",
      [key]
    );
    if (!flag) return defaultFlags[key];
    return flag.enabled === 1 || flag.enabled === true;
  } catch {
    return defaultFlags[key];
  }
}

export async function setFeatureFlag<K extends FeatureFlagKey>(
  key: K,
  enabled: boolean
): Promise<void> {
  const existing = await queryOne<FeatureFlag>(
    "SELECT * FROM FeatureFlag WHERE key = ?",
    [key]
  );
  if (existing) {
    await execute(
      "UPDATE FeatureFlag SET enabled = ?, updatedAt = ? WHERE key = ?",
      [enabled ? 1 : 0, now(), key]
    );
  } else {
    await execute(
      "INSERT INTO FeatureFlag (id, key, enabled, updatedAt) VALUES (?, ?, ?, ?)",
      [generateId(), key, enabled ? 1 : 0, now()]
    );
  }
}
