# Plan: Print-Friendly Itinerary

## What
A clean, printable version of the event details / timeline page that guests can print or save as PDF for day-of reference. Uses CSS `@media print` so no separate page is needed.

## Key Implementation Points
- Add print styles to the event details / timeline page via `@media print` CSS
- Hide navigation, footer, animations, background, and interactive elements when printing
- Format timeline as a clean vertical list with large readable text
- Include: event name, time, location, dress code, key addresses
- "Print / Save as PDF" button that triggers `window.print()`
- Optional: a dedicated `/event-details/print` route with a stripped-down layout for sharing as a direct link
- Ensure the printed output is black-and-white friendly (no gold-on-dark)

## Data Model Impact
None.

## Complexity
**Low** — primarily CSS work with a small UI button addition.

## Decisions
- Print button only (no dedicated /print URL)
- Print content: timeline + venue details; not the full wedding party list
- Include couple name + date as branding on the printed page
