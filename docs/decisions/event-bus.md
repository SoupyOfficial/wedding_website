# Decision: Event Bus

## Status: Deferred — Not Implemented

As of the July 2026 audit cleanup, the event bus described in `lib/events/` was never implemented. The directory does not exist, no event types are defined in production code, and no subscribers are registered. The event bus concept was documented as if it existed but was purely aspirational.

## Current State

- **No `lib/events/` directory exists**
- **No event bus singleton or class is exported** from any module
- **No subscribers are registered** anywhere in the application
- **All side effects are handled inline** within request handlers (e.g., RSVP submission updates settings and creates a log entry directly)

## Evaluation

For a single-admin wedding website with modest traffic, the decoupling benefit of an event bus does not justify the added complexity. Direct `afterRsvpSubmit()` calls or inline handling in route handlers provides sufficient separation for this project's needs.

## If Revisited

If future needs warrant an event bus (e.g., multiple side effects from a single action, cross-module notifications), consider:
- Moving subscriber registration to a central module imported in middleware or layout
- Using a simple `EventEmitter` from Node.js `events` module
- Evaluating Vercel function lifecycle implications (in-process state doesn't persist between invocations)

## Related

- [Architecture Overview](../ARCHITECTURE.md)
- [Audit Report](../AUDIT-2026-05-27.md)
