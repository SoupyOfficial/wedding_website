import { query, execute, generateId, now, toBoolAll } from "@/lib/db";
import type { GuestBookEntry } from "@/lib/db-types";

/**
 * Fetch all visible guestbook entries, newest first.
 */
export async function getVisibleEntries(): Promise<GuestBookEntry[]> {
  const entries = await query<GuestBookEntry>(
    "SELECT * FROM GuestBookEntry WHERE isVisible = 1 ORDER BY createdAt DESC"
  );
  toBoolAll(entries, "isVisible");
  return entries;
}

/**
 * Create a new guestbook entry (pending moderation).
 * Truncates name to 100 and message to 500 characters.
 */
export async function createEntry(name: string, message: string): Promise<void> {
  const id = generateId();
  const timestamp = now();
  await execute(
    "INSERT INTO GuestBookEntry (id, name, message, isVisible, createdAt) VALUES (?, ?, ?, 0, ?)",
    [id, name.trim().slice(0, 100), message.trim().slice(0, 500), timestamp]
  );
}
