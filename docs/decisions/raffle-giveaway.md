# Decision: Raffle Giveaway

## Status: Accepted — 2026-08-26

### Summary

Formalizes the wedding raffle: 2 winners, one pair of one-day Universal Studios & Islands of Adventure tickets each (4 tickets total), auto-entry on RSVP ordered by submission time, a live drawing at the reception, and offline winner fulfillment.

### Background

- **Prior state**: `SiteSettings` already had `raffleTicketCount` and `rafflePrize`, but the public copy conflicted:
  - Homepage/elsewhere: "Purchase raffle tickets at the reception — proceeds to newlywed fund"
  - Elsewhere: "The first RSVPs will be entered to win"
  - The questionnaire said the first-N RSVPs get a free entry.
- The couple finalized the mechanics in Aug 2026, and this record captures the agreed rules and implementation.

### Finalized Rules

- **Prize**: 2 pairs of one-day Universal Studios Florida & Islands of Adventure tickets (4 tickets total) to 2 separate winners.
  - NOT valid at Epic Universe.
  - Subject to blackout dates.
- **Entry**:
  - Every RSVP submission automatically earns one entry — no purchase necessary.
  - Entries are ordered by RSVP submission timestamp.
  - Pool = guests who have RSVP'd.
  - Additional raffle tickets purchasable at the reception.
- **Drawing**: LIVE at the reception; must be present to win.
- **Fulfillment**: offline — winners give Ashley their full legal name(s) + preferred visit date. The name on the ticket must match a valid photo ID at the gate.
- **Publication**: rules published on the public `/raffle` page.
- **Behavior promise**: winners must follow all park rules. The tickets are provided through Ashley's employment with Universal Orlando; any infractions would directly reflect on Ashley's employment.

### Data Model & Ordering

- `Guest.rsvpSubmittedAt` (`DateTime?`) is the ordering key.
  - Set once on the first attending RSVP in `lib/services/rsvp.service.ts`, immutable thereafter.
- Migration `prisma/migrations/20260826120000_add_rsvp_submitted_at_to_guest/migration.sql`:
  - Adds the column to production Turso (it previously existed only via local `db push`).
  - Backfills from `rsvpRespondedAt` (an identical timestamp written on first submission).
- Eligibility query:

```sql
SELECT id, firstName, lastName, email, rsvpSubmittedAt
FROM Guest
WHERE rsvpStatus = 'attending' AND rsvpSubmittedAt IS NOT NULL
ORDER BY rsvpSubmittedAt ASC
```

### Site Implementation

- Public `/raffle` rules page gated by new `rafflePageEnabled` flag (default `true`).
- Public nav link (non-primary) + admin nav link.
- Admin `/admin/raffle` — read-only entries list (count + copy-to-clipboard) via `GET /api/v1/admin/raffle/entries`.
- Copy updated on: homepage, RSVP header + success screen, travel callouts.
- Admin settings "Reception Raffle" select now: `0` = Disabled / `4` = "Enabled — 2 winners × 1 pair each", with value mapping `settings.raffleTicketCount > 0 ? 4 : 0`.
- `raffleTicketCount` default changed 2 → 4.
- Test coverage: `__tests__/api/admin-raffle-entries.test.ts` added; `e2e/settings.spec.ts` updated.

### Fulfillment Workflow (Offline)

After the live drawing:

1. Winners provide Ashley their legal name(s) (must match photo ID) + preferred visit date.
2. Ashley confirms the date is not blacked out and issues the tickets.
3. Winners are reminded of the behavior promise (park rules, Ashley's employment).

### Assumptions & Open Items

✅ Confirmed by the couple (2026-08-27): items (a), (b), (c), (d), (e) below.

- **(a)** Entry pool = attending RSVPs only; declined RSVPs are not entered. — confirmed
- **(b)** "Only people who have already RSVP'd" is interpreted as RSVP'd guests (not all site visitors). The final pool snapshot is taken from the admin page. — confirmed
- **(c)** Plus-ones do not get separate entries (no separate guest row). — confirmed
- **(d)** Extra-ticket proceeds go to the newlywed fund (carried over from existing copy). — confirmed
- **(e)** Blackout dates not yet specified — communicated at fulfillment. — confirmed
- **(f)** Production must run `npm run db:deploy` to apply the migration before using the admin raffle page. (being applied as part of this implementation)
- **(g)** Legacy `raffleTicketCount` values (e.g. `2`) display as enabled via the `> 0 ? 4 : 0` mapping until saved.

### Open Questions for the Couple

- Exact blackout dates.
- Whether declined RSVPs should also be entered.
- Confirm extra-ticket proceeds go to the newlywed fund.
- How winners will be contacted if not present when drawn.
