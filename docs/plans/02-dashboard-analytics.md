# Plan: Dashboard Analytics Depth

## What
Expand the admin dashboard (`/admin`) with meaningful at-a-glance stats and charts: RSVP completion rate, meal/dietary breakdown, response trend over time, and a deadline countdown.

## Key Implementation Points
- New API endpoint(s) aggregating guest data: total invited, attending, declined, pending, +ones
- Meal option breakdown chart (pie or bar) — counts per meal type
- Dietary restriction summary (gluten-free, vegan, allergies, etc.)
- RSVP response trend: a sparkline or small bar chart of responses per day/week
- Days-until-deadline and days-until-wedding prominent counters
- All data pulled from existing `Guest`, `MealOption`, and `SiteSettings` models

## Data Model Impact
None — all data already exists in the database.

## Complexity
**Low-Medium** — mostly new API aggregation queries and chart components. No schema changes.

## Decisions
- Build all four stats: RSVP completion rate, meal/dietary breakdown, response trend, countdowns
- Use `recharts` (lighter weight, React-native)
- Trend chart: cumulative RSVPs over time
