# Plan: Duplicate Guest Detection on Import

## What
When importing a guest list (CSV upload), detect potential duplicates before saving and surface them to the admin for review. Prevents double-invites and messy guest data.

## Key Implementation Points
- Duplicate detection on the import API (`/api/v1/admin/guests/import`)
- Detection strategies (in order of confidence):
  1. Exact email match → definite duplicate
  2. Exact name match (case-insensitive) → likely duplicate
  3. Fuzzy name match (e.g., "John Smith" vs "Jon Smith") → possible duplicate (using `fastest-levenshtein` or similar)
- Import preview step: show a table of incoming guests with a "DUPLICATE?" warning badge before committing
- Admin can: accept the import (overwrite), skip the duplicate, or merge (update existing record)
- Also surface duplicates within the existing database on the `/admin/guests` page as a passive warning badge

## Data Model Impact
None.

## Complexity
**Medium** — the preview/review UI step is the bulk of the work; fuzzy matching adds some complexity but is optional for v1.

## Decisions
- Exact match only in v1 (email + case-insensitive name); fuzzy matching deferred
- On merge: incoming data updates contact fields only; RSVP status preserved
- Also check on manual guest creation, not just import
