# Plan: Vendor / Contact Manager

## What
A simple CRM-style vendor list in the admin panel. Tracks all wedding vendors with contact info, contract status, payment milestones, and notes — replacing a separate spreadsheet or notes app.

## Key Implementation Points
- New admin page: `/admin/vendors`
- New `Vendor` model: name, category, contact name, phone, email, website, contract status (none/signed/complete), deposit due date, final payment due date, total cost, notes
- Contract status badge (color-coded: red = unsigned, yellow = signed/pending, green = complete)
- Quick-filter by category or status
- Link vendors to budget items (optional, if budget tracker is also built)
- No file upload for contracts (out of scope for v1)

## Data Model Impact
New `Vendor` model. Migration required.

## Complexity
**Low** — standard CRUD admin page, similar in pattern to Hotels or Entertainment pages already in the codebase.

## Decisions
- Vendors link to budget line items (vendor cost auto-reflected in budget tracker)
- No vendor deadline timeline view in v1
- Instagram/social handle field: include as optional
