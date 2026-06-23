# Plan: Skeleton Loaders & Loading States

## What
Add skeleton loading states to data-fetching pages so guests see a polished placeholder instead of a blank screen or spinner while content loads.

## Key Implementation Points
- Priority pages: Registry, Gallery, Music/Song Requests, Guest Book, Wedding Party
- Build a reusable `<Skeleton>` component (animated shimmer, respects the site's dark/ivory color palette)
- Apply skeletons to:
  - Registry: card grid skeletons while items load
  - Gallery: image grid skeletons (aspect-ratio boxes)
  - Song Requests: list row skeletons
  - Guest Book: entry card skeletons
  - Wedding Party: profile card skeletons
- Use Next.js `loading.tsx` files per route for automatic Suspense integration
- Ensure skeletons match the approximate shape of the real content (same dimensions, columns, count)

## Data Model Impact
None.

## Complexity
**Low** — one reusable component + `loading.tsx` files per route.

## Decisions
- Both loading skeletons and error states with retry buttons
- Shimmer: neutral dark-on-darker (matches midnight palette); gold accent on shimmer highlight
- Priority order: Registry, Gallery, Guest Book, Song Requests, Wedding Party
