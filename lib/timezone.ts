/**
 * US Eastern Time (America/New_York) timezone utilities.
 *
 * The wedding venue is in Apopka, Florida (Eastern Time).
 * All dates in the database are entered by admins in Eastern Time but stored
 * without timezone info. JavaScript's `new Date()` interprets timezone-less
 * ISO strings as UTC per ES6, which shifts everything by 4–5 hours.
 *
 * These helpers add the correct Eastern offset so countdowns, deadline
 * enforcement, and date displays all work correctly regardless of where
 * the server or browser is running.
 */

/**
 * Determine whether a given date falls in US Eastern Daylight Time (EDT, UTC-4)
 * or Eastern Standard Time (EST, UTC-5).
 *
 * DST rules (US, post-2007):
 *   - Starts: second Sunday of March at 2:00 AM local
 *   - Ends:   first Sunday of November at 2:00 AM local
 */
export function isEasternDST(year: number, month: number, day: number): boolean {
  // month is 1-indexed (matches ISO date parts); Date constructor expects 0-indexed
  const d = new Date(year, month - 1, day);

  // Second Sunday of March
  const march1 = new Date(year, 2, 1); // March 1
  const firstSunMar = new Date(year, 2, 1 + ((7 - march1.getDay()) % 7));
  const dstStart = new Date(year, 2, firstSunMar.getDate() + 7);

  // First Sunday of November
  const nov1 = new Date(year, 10, 1); // November 1
  const dstEnd = new Date(year, 10, 1 + ((7 - nov1.getDay()) % 7));

  return d >= dstStart && d < dstEnd;
}

/**
 * Return the UTC offset string for Eastern Time on the given date.
 * @param dateStr  ISO date part: "YYYY-MM-DD"
 * @returns "-04:00" (EDT) or "-05:00" (EST)
 */
export function getEasternTimeOffset(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return isEasternDST(y, m, d) ? "-04:00" : "-05:00";
}

/**
 * Build a fully timezone-qualified ISO-8601 string for a date/time in Eastern Time.
 *
 * @param dateStr  ISO date part: "YYYY-MM-DD"
 * @param timeStr  time part: "HH:MM" (defaults to "00:00")
 * @returns         "YYYY-MM-DDTHH:MM:00-04:00" or "YYYY-MM-DDTHH:MM:00-05:00"
 *
 * @example
 *   toEasternISO("2026-11-13", "16:00")  // "2026-11-13T16:00:00-05:00" (EST)
 *   toEasternISO("2026-10-04", "23:59")  // "2026-10-04T23:59:00-04:00" (EDT)
 */
export function toEasternISO(dateStr: string, timeStr?: string): string {
  const offset = getEasternTimeOffset(dateStr);
  const time = timeStr || "00:00";
  return `${dateStr}T${time}:00${offset}`;
}

/**
 * Check whether an Eastern-time timestamp is in the past.
 *
 * @param dateStr  ISO date part: "YYYY-MM-DD"
 * @param timeStr  time part: "HH:MM" (defaults to "00:00")
 * @returns        true if the Eastern-time moment has already passed
 */
export function isEasternPast(dateStr: string, timeStr?: string): boolean {
  const iso = toEasternISO(dateStr, timeStr);
  return new Date(iso).getTime() < Date.now();
}

/**
 * Format an Eastern-time date string for display.
 *
 * @param dateStr    ISO date part: "YYYY-MM-DD"
 * @param options    toLocaleDateString options (default: long month, day, year)
 * @param locale     locale string (default: "en-US")
 * @returns          formatted date, or null if dateStr is invalid
 *
 * @example
 *   formatEasternDate("2026-11-13")                         // "November 13, 2026"
 *   formatEasternDate("2026-10-04", { weekday: "long", ... })  // "Sunday, October 4, 2026"
 */
export function formatEasternDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string | null {
  if (!dateStr || dateStr.length < 10) return null;
  try {
    const iso = toEasternISO(dateStr.slice(0, 10));
    return new Date(iso).toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...options,
    });
  } catch {
    return null;
  }
}
