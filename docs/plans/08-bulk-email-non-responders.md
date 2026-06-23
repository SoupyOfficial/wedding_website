# Plan: Bulk Email to Non-Responders

## What
A one-click (or scheduled) email blast targeting guests who haven't responded to the RSVP yet, filtered to those approaching or past the deadline. Leverages the existing email campaign infrastructure.

## Key Implementation Points
- New "Send Reminder" shortcut on `/admin/guests` and `/admin/communications`
- Pre-built email template: "We haven't heard from you yet — please RSVP by [date]"
- Audience filter: `RSVP status = pending` + optional `invited date before X`
- Preview: shows a list of recipients before sending
- Uses existing `EmailCampaign` + `EmailLog` + Resend integration already in the codebase
- Respects `massEmailEnabled` feature flag
- Adds a new built-in template type: `RSVP_REMINDER`
- Optional: schedule the reminder (e.g., "send 2 weeks before deadline automatically")

## Data Model Impact
Minimal — adds a new `EmailTemplate` record seeded as a default. No schema changes needed.

## Complexity
**Low** — the email pipeline already exists. This is mostly wiring up a pre-filtered audience + template shortcut.

## Decisions
- Both manual trigger and auto-schedule supported
- Tone: warm/friendly, personalized with guest first name, links to RSVP page
- Declined guests excluded from RSVP reminders (but can still receive other campaign emails)
