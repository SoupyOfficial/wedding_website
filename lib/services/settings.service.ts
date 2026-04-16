import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";

/**
 * Fetch a projected subset of SiteSettings.
 * Only SELECTs the requested columns and converts booleans automatically.
 */
export async function getSettings<K extends keyof SiteSettings>(
  ...fields: K[]
): Promise<Pick<SiteSettings, K> | null> {
  const cols = fields.join(", ");
  const row = await queryOne<Pick<SiteSettings, K>>(
    `SELECT ${cols} FROM SiteSettings WHERE id = ?`,
    ["singleton"]
  );
  if (row) {
    const boolFields = fields.filter((f) =>
      (SETTINGS_BOOLS as readonly string[]).includes(f as string)
    );
    if (boolFields.length) toBool(row, ...boolFields.map(String));
    // Strip any extra fields not explicitly requested (defense-in-depth)
    const allowed = new Set<string>(fields as unknown as string[]);
    for (const key of Object.keys(row)) {
      if (!allowed.has(key)) delete (row as Record<string, unknown>)[key];
    }
  }
  return row;
}

/**
 * Fetch all SiteSettings fields (admin use).
 */
export async function getFullSettings(): Promise<SiteSettings | null> {
  const row = await queryOne<SiteSettings>(
    "SELECT * FROM SiteSettings WHERE id = ?",
    ["singleton"]
  );
  if (row) toBool(row, ...SETTINGS_BOOLS);
  return row;
}
