# Plan: Dashboard Analytics Depth

## What
Expand the admin dashboard (`/admin`) with meaningful at-a-glance stats and charts: RSVP completion rate, dietary restriction summary, response trend over time, and a deadline countdown.

## Key Implementation Points
- New API endpoint(s) aggregating guest data: total invited, attending, declined, pending, +ones
- Dietary restriction summary (allergies, free-text dietary needs)
- RSVP response trend: a sparkline or small bar chart of responses per day/week
- Days-until-deadline and days-until-wedding prominent counters
- All data pulled from existing `Guest` and `SiteSettings` models

## Data Model Impact
None — all data already exists in the database.

## Complexity
**Low-Medium** — mostly new API aggregation queries and chart components. No schema changes.

## Decisions
- Build all four stats: RSVP completion rate, dietary summary, response trend, countdowns
- Use `recharts` (lighter weight, React-native)
- Trend chart: cumulative RSVPs over time
