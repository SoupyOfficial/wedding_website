# Plan: Budget Tracker

## What
A lightweight wedding budget tracker in the admin panel. Tracks vendors/line items with estimated vs. actual cost, deposit paid, and payment due dates. Shows a summary of total budget vs. total spent.

## Key Implementation Points
- New admin page: `/admin/budget`
- New `BudgetItem` model: category, vendor name, estimated cost, actual cost, deposit amount, deposit paid (bool), due date, notes, paid (bool)
- Categories: Venue, Catering, Photography, Florals, Music/DJ, Attire, Transportation, Invitations, Honeymoon, Misc
- Summary bar: total estimated vs. total actual, remaining budget
- Upcoming payment due dates highlighted
- Optional: total budget ceiling set in SiteSettings

## Data Model Impact
New `BudgetItem` model in schema. Migration required.

## Complexity
**Low-Medium** — straightforward CRUD with a summary calculation layer. The schema addition is the main change.

## Decisions
- Optional budget ceiling: UI supports setting one but defaults to unset (line items only view until ceiling is set)
- No payment due date email reminders in v1
- Pre-seed default categories (Venue, Catering, Photography, etc.) but allow custom
