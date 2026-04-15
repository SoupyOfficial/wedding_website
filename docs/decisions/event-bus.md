# Decision: Event Bus

## Choice: In-process singleton event emitter for decoupled event handling

### Why

- Decouples side effects from main request handlers. When an RSVP is submitted, the handler doesn't need to know about notifications, analytics, or logging — it just emits `rsvp:submitted`.
- Standard pub/sub pattern. Handlers can be added/removed without touching the emitting code.

### Implementation

Custom EventBus class (no external dependency):

- `on<T>(event, handler)` → subscribe, returns unsubscribe function
- `emit<T>(event, payload)` → fires all handlers via Promise.all, catches errors per-handler
- `off(event)` → remove all handlers for event
- Singleton exported from `lib/events/event-bus.ts`

### Defined Event Types

| Event | Payload | Emitted From |
| ----- | ------- | ------------ |
| rsvp:submitted | guestId, status, guestName, details | RSVP submit route |
| guest:created | guestId, firstName, lastName | Admin guest create |
| photo:uploaded | photoId, category, url | Photo upload route |
| settings:updated | changedFields[] | Admin settings route |
| guestbook:signed | entryId, name, message | Guestbook submit route |

### Tradeoffs Accepted

- **In-process only**: Events don't survive server restarts or cross serverless function boundaries. On Vercel, each API route runs in its own invocation — the event bus singleton may not persist listeners between requests.
- **No guaranteed subscribers**: Events are emitted but it's unclear which handlers (if any) are registered in production. The subscriber registration would need to happen in a module that's imported on every request.
- **Promise.all semantics**: All handlers run in parallel. If one throws, others still complete, but the error is caught and logged silently.

### Simplification Candidates

- **Audit actual usage**: If no subscribers are registered in production code (only in tests), the event bus is dead infrastructure and can be removed.
- **Replace with direct calls**: For a single-admin wedding site, the decoupling benefit may not justify the indirection. A simple `afterRsvpSubmit()` function is easier to trace.
- **If keeping**: Move subscriber registration to a central `lib/events/subscribers.ts` that's imported in middleware or layout to ensure listeners are active.
