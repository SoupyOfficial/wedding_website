# Plan: Visual Seating Chart

## What
A drag-and-drop seating planner in the admin dashboard. Displays configurable tables on a canvas, with an unassigned guest sidebar. Dragging a guest onto a table assigns them; existing table number data on the Guest model is used as the source of truth.

## Key Implementation Points
- New admin page: `/admin/seating`
- Canvas rendered with React (could use `@dnd-kit` for drag-and-drop, plain divs with drag events, or a library like `react-flow`)
- Table layout is configurable: shape (round/rect), capacity, label
- Guest sidebar lists unassigned guests with search/filter
- Assignment persists to existing `tableNumber` field on the `Guest` model (no schema change needed)
- Print view: clean printable seating chart for day-of coordination

## Data Model Impact
- No schema changes — `Guest.tableNumber` already exists
- Possibly add a `SeatingTable` config table (name, capacity, shape, x/y position) if we want persistent layout
- OR store table layout as JSON in `SiteSettings`

## Complexity
**Medium-High** — drag-and-drop and canvas positioning are the hardest parts; data layer is already there.

## Decisions
- Layout: grid of table cards (not a canvas floor plan)
- Place card export: yes — printable PDF sheet of place cards
