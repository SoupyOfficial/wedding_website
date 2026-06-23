# Plan: Admin Activity Log Viewer

## What
A UI for the `AdminActivityLog` model that already exists in the database. Lets admins audit what actions have been taken (guest edits, photo approvals, settings changes, etc.) with timestamps and metadata.

## Key Implementation Points
- New admin page: `/admin/activity` (or a tab within `/admin/settings`)
- API endpoint: `GET /api/v1/admin/activity` with pagination and filters
- Display columns: timestamp, action, entity type, entity ID/name, metadata summary
- Filters: by action type, entity type, date range
- Color-coded action badges (create = green, update = yellow, delete = red, approve = blue)
- Pagination (most recent first)
- Ensure all existing admin actions actually write to `AdminActivityLog` (audit coverage may be partial)

## Data Model Impact
None — model already exists. May need to add logging calls to admin API routes that currently skip it.

## Complexity
**Low-Medium** — the read/display side is simple; auditing which routes are missing log writes requires a codebase sweep.

## Open Questions
- Should the activity log be its own nav item, or nested under Settings?
- How far back should logs be retained? (could add a cleanup/purge mechanism)
- Should log entries include the admin user identity (currently there's only one admin, but worth noting)?
