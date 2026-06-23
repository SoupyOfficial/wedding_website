import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/services/settings.service";

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function parseTime(timeStr: string | null | undefined, date: Date): Date {
  if (!timeStr) return date;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!match) return date;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hours !== 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  const d = new Date(date);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

function buildICS(event: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@forevercampbells.com`;
  const now = formatICSDate(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Forever Campbells//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(event.start)}`,
    `DTEND:${formatICSDate(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${event.title} is tomorrow!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event: eventSlug } = await params;
  const s = await getSettings(
    "coupleName", "weddingDate", "weddingTime",
    "venueName", "venueAddress",
    "receptionTime", "receptionVenue", "receptionAddress",
    "rehearsalDinnerDate", "rehearsalDinnerTime", "rehearsalDinnerVenue", "rehearsalDinnerAddress",
    "dayAfterBrunchDate", "dayAfterBrunchTime", "dayAfterBrunchVenue", "dayAfterBrunchAddress"
  );

  const coupleName = s?.coupleName || "Jacob & Ashley";
  const venueLocation = `${s?.venueName || "The Highland Manor"}, ${s?.venueAddress || "Apopka, Florida"}`;

  let ics: string;
  let filename: string;

  switch (eventSlug) {
    case "ceremony": {
      if (!s?.weddingDate) return NextResponse.json({ error: "No wedding date set" }, { status: 400 });
      const baseDate = new Date(s.weddingDate);
      const start = parseTime(s?.weddingTime, baseDate);
      const end = new Date(start.getTime() + 90 * 60 * 1000);
      ics = buildICS({
        title: `${coupleName} — Wedding Ceremony`,
        description: `You are invited to the wedding ceremony of ${coupleName}. Please arrive 15 minutes early.`,
        location: venueLocation,
        start,
        end,
      });
      filename = "wedding-ceremony.ics";
      break;
    }
    case "reception": {
      if (!s?.weddingDate) return NextResponse.json({ error: "No wedding date set" }, { status: 400 });
      const baseDate = new Date(s.weddingDate);
      const receptionVenue = s?.receptionVenue ? `${s.receptionVenue}, ${s?.receptionAddress || ""}` : venueLocation;
      const start = parseTime(s?.receptionTime || s?.weddingTime, baseDate);
      // reception starts ~30min after ceremony time; if no separate time given, offset by 2hrs
      const receptionStart = s?.receptionTime ? start : new Date(start.getTime() + 120 * 60 * 1000);
      const end = new Date(receptionStart.getTime() + 4 * 60 * 60 * 1000);
      ics = buildICS({
        title: `${coupleName} — Wedding Reception`,
        description: `Join ${coupleName} for dinner, dancing, and celebration at their wedding reception.`,
        location: receptionVenue,
        start: receptionStart,
        end,
      });
      filename = "wedding-reception.ics";
      break;
    }
    case "rehearsal": {
      if (!s?.rehearsalDinnerDate) return NextResponse.json({ error: "No rehearsal dinner date set" }, { status: 400 });
      const baseDate = new Date(s.rehearsalDinnerDate);
      const start = parseTime(s?.rehearsalDinnerTime, baseDate);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const location = s?.rehearsalDinnerVenue
        ? `${s.rehearsalDinnerVenue}, ${s?.rehearsalDinnerAddress || ""}`
        : venueLocation;
      ics = buildICS({
        title: `${coupleName} — Rehearsal Dinner`,
        description: `Rehearsal dinner for the wedding of ${coupleName}.`,
        location,
        start,
        end,
      });
      filename = "rehearsal-dinner.ics";
      break;
    }
    case "brunch": {
      if (!s?.dayAfterBrunchDate) return NextResponse.json({ error: "No brunch date set" }, { status: 400 });
      const baseDate = new Date(s.dayAfterBrunchDate);
      const start = parseTime(s?.dayAfterBrunchTime, baseDate);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const location = s?.dayAfterBrunchVenue
        ? `${s.dayAfterBrunchVenue}, ${s?.dayAfterBrunchAddress || ""}`
        : venueLocation;
      ics = buildICS({
        title: `${coupleName} — Day-After Brunch`,
        description: `Join ${coupleName} for a relaxed day-after brunch to continue the celebration.`,
        location,
        start,
        end,
      });
      filename = "day-after-brunch.ics";
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown event" }, { status: 404 });
  }

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
