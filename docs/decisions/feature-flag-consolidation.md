# Decision: Feature Flag Consolidation

## Status: Evaluated — No-Go for Now

### Proposal

Collapse the 13 page-toggle feature flags (e.g., `travelPageEnabled`, `rsvpEnabled`, `galleryPageEnabled`) into a single `enabledPages: string[]` field on SiteSettings. Instead of 13 separate `FeatureFlag` rows, there would be one array field.

### Current State

20 total flags, of which:
- 13 are page toggles (control visibility of a public page)
- 7 are feature toggles (control sub-features like photo upload, song requests, timeline display)

Each page flag controls one page at the server-component level via `checkFeatureFlag()`.

### Why Not Consolidate

1. **Breaking change risk**: 13 public pages, the Navigation component, and the Features admin page all reference individual flag keys. Migrating to an array would touch ~20 files.

2. **No real benefit at this scale**: 13 rows in the FeatureFlag table is trivial. The admin Features page already shows all flags in a grid — replacing 13 toggles with a multi-select or checkbox list doesn't reduce admin complexity meaningfully.

3. **Feature flags serve different audiences**: The FeatureFlag model handles all flags uniformly (page toggles and feature toggles). Splitting the page toggles into SiteSettings would create two systems for what's currently one.

4. **Testing impact**: Individual flags are easy to mock per-test. An array would require tests to manage the entire array.

5. **Low priority relative to effort**: The current system works flawlessly. The "complexity" of individual flags is organizational, not operational.

### When to Reconsider

- If the number of page toggles exceeds 20 (unlikely before the wedding)
- If the Features admin page becomes unwieldy (current grid handles 20 flags easily)
- If a future refactor already touches most flag-dependent files

### Conclusion

**Keep current individual flag system.** Document the page/feature distinction for clarity, but do not consolidate. The 13 page toggles are not a real problem — they're a semantic observation, not a maintenance burden.

### Related

- [Feature Flags Decision](./feature-flags.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Audit Report](../AUDIT-2026-05-27.md)
