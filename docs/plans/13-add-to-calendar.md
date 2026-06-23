# Plan: Add to Calendar Button

## What
Buttons on the event details page letting guests add the wedding (and optionally the rehearsal dinner / other events) to their calendar app of choice. Zero friction, works on any device.

## Key Implementation Points
- Three targets: Google Calendar (URL), Apple Calendar (.ics download), Outlook (.ics download)
- Event data sourced from `SiteSettings` + `TimelineEvent` records (weddingDate, weddingTime, venueName, venueAddress)
- Google Calendar: construct a `https://calendar.google.com/calendar/render?action=TEMPLATE&...` URL
- Apple / Outlook: generate and serve a `.ics` file via a new API route (`GET /api/v1/calendar/wedding.ics`)
- Button group component, reusable for multiple events (ceremony, rehearsal dinner, etc.)
- "Add to Calendar" dropdown with three options + icons

## Data Model Impact
None — reads from existing `SiteSettings`.

## Complexity
**Low** — Google Calendar is a URL build; `.ics` generation is a simple text format, no library needed.

## Decisions
- All four events: ceremony, reception, rehearsal dinner, day-after brunch
- Include venue address in the location field of .ics
- Pre-set 1-day reminder in the calendar event
