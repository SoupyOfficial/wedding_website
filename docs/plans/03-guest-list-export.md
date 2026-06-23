# Plan: Guest List Export (CSV / PDF)

## What
One-click export of the guest list from the admin guests page. Exports a structured file with all relevant columns for use by caterers, coordinators, and venue staff.

## Key Implementation Points
- Export button on `/admin/guests` with format selector (CSV, PDF)
- **CSV**: server-side generation using a simple string builder or `csv-stringify`; streamed as a file download
- **PDF**: server-side generation using `@react-pdf/renderer` or `pdfkit`; formatted as a clean table
- Columns: Name, Email, RSVP Status, Attending Count, +One Name, Meal Preference, Dietary Notes, Table Number, Notes
- Filtered exports: respect any active search/filter state on the guests page (e.g., export only "Attending" guests)
- New API route: `GET /api/v1/admin/guests/export?format=csv&status=attending`

## Data Model Impact
None.

## Complexity
**Low** — CSV is trivial; PDF adds moderate complexity but libraries handle the heavy lifting.

## Decisions
- CSV only (no PDF)
- Include children count as a column
- Include all columns including email
