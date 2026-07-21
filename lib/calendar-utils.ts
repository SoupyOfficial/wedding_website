/**
 * Shared Google Calendar helper utilities.
 * Extracted from schedule and event-details pages to avoid duplication.
 */

export interface CalendarEvent {
  slug: string;
  label: string;
  available: boolean;
  googleUrl: string;
}

function gcalUrl(title: string, start: string, end: string, location: string, details: string): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  return `${base}&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
}

export function toGcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildCalendarEvents(
  settings: {
    weddingDate?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    coupleName?: string | null;
    receptionVenue?: string | null;
    rehearsalDinnerDate?: string | null;
    rehearsalDinnerVenue?: string | null;
    dayAfterBrunchDate?: string | null;
    dayAfterBrunchVenue?: string | null;
  }
): CalendarEvent[] {
  const venueLoc = `${settings.venueName || "The Highland Manor"}, ${settings.venueAddress || "Apopka, Florida"}`;
  const couple = settings.coupleName || "Jacob & Ashley";
  const weddingBase = settings.weddingDate ? new Date(settings.weddingDate) : null;

  return [
    {
      slug: "ceremony",
      label: "Wedding Ceremony",
      available: !!weddingBase,
      googleUrl: weddingBase
        ? gcalUrl(
            `${couple} — Wedding Ceremony`,
            toGcalDate(weddingBase),
            toGcalDate(new Date(weddingBase.getTime() + 90 * 60 * 1000)),
            venueLoc,
            `Wedding ceremony of ${couple}`
          )
        : "",
    },
    {
      slug: "reception",
      label: "Wedding Reception",
      available: !!weddingBase,
      googleUrl: weddingBase
        ? gcalUrl(
            `${couple} — Wedding Reception`,
            toGcalDate(new Date(weddingBase.getTime() + 120 * 60 * 1000)),
            toGcalDate(new Date(weddingBase.getTime() + 6 * 60 * 60 * 1000)),
            settings.receptionVenue || venueLoc,
            `Reception for ${couple}`
          )
        : "",
    },
    {
      slug: "rehearsal",
      label: "Rehearsal Dinner",
      available: !!settings.rehearsalDinnerDate,
      googleUrl: settings.rehearsalDinnerDate
        ? gcalUrl(
            `${couple} — Rehearsal Dinner`,
            toGcalDate(new Date(settings.rehearsalDinnerDate)),
            toGcalDate(new Date(new Date(settings.rehearsalDinnerDate).getTime() + 2 * 60 * 60 * 1000)),
            settings.rehearsalDinnerVenue || venueLoc,
            `Rehearsal dinner for ${couple}`
          )
        : "",
    },
    {
      slug: "brunch",
      label: "Day-After Brunch",
      available: !!settings.dayAfterBrunchDate,
      googleUrl: settings.dayAfterBrunchDate
        ? gcalUrl(
            `${couple} — Day-After Brunch`,
            toGcalDate(new Date(settings.dayAfterBrunchDate)),
            toGcalDate(new Date(new Date(settings.dayAfterBrunchDate).getTime() + 2 * 60 * 60 * 1000)),
            settings.dayAfterBrunchVenue || venueLoc,
            `Day-after brunch with ${couple}`
          )
        : "",
    },
  ];
}
