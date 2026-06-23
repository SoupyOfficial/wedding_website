# Plan: Mobile Navigation Improvement

## What
Improve the guest-facing mobile navigation experience. The current hamburger menu works but could benefit from a smoother interaction pattern given the site's animated, immersive design aesthetic.

## Key Implementation Points
- Evaluate current `Navigation.tsx` mobile behavior
- Options (pick one based on preference):
  - **Full-screen overlay menu**: slides in from top/side, links in large type, close button — matches the starry/elegant aesthetic
  - **Bottom sheet drawer**: slides up from bottom, thumb-friendly — more app-like
  - **Bottom tab bar**: persistent 4-5 key links pinned to the bottom of the screen (Home, RSVP, Details, More) — best for deep browsing
- Ensure smooth open/close animation (Framer Motion already in the project)
- Active link highlighting based on current route
- Respect feature flags — hidden pages don't appear in nav

## Data Model Impact
None.

## Complexity
**Low-Medium** — primarily a component refactor of `Navigation.tsx` with animation.

## Decisions
- Full-screen overlay menu (animated, matches the starry/immersive aesthetic)
- Show all feature-flag-enabled pages (no "More" overflow needed for current page count)
- Framer Motion for open/close animation
