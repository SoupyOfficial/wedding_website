# Audit Remediation Plan — May 27, 2026

Based on the audit at `docs/AUDIT-2026-05-27.md`. This plan is ordered by priority — each phase is independently executable and verifiable.

---

## Phase 1: High Priority (production safety + CI integrity)

---

### Issue 1: Fix 5 Failing Tests in `photos-upload.test.ts`

**Root Cause:** The mock for `@/lib/providers` does not align with how `photo.service.ts` calls `getProvider()`. The service calls `getProvider("storage")` at module evaluation time (not per-request), so switching the mock mid-test with `vi.mocked(getProvider).mockReturnValue(...)` doesn't affect the already-evaluated service reference. All 5 failing tests get HTTP 500 because the mock chain is broken.

**Target File:** `__tests__/api/photos-upload.test.ts`

**Step-by-Step:**

1. **Mock `photo.service` instead of `@/lib/providers`.** The route handler imports `uploadPhoto` from `@/lib/services/photo.service`. Mock the service module directly so the mock controls return values consistently.

2. **Replace the `@/lib/providers` mock** with a `@/lib/services/photo.service` mock:
   ```ts
   vi.mock("@/lib/services/photo.service", () => ({
     uploadPhoto: vi.fn(),
     PhotoValidationError: class extends Error {
       constructor(message: string) { super(message); this.name = "PhotoValidationError"; }
     },
   }));
   ```

3. **For the "no file" test** (returns 400): No change needed — this validation happens in the route before calling `uploadPhoto`.

4. **For the "non-image file type" test** (returns 400): Have `uploadPhoto` throw `PhotoValidationError`:
   ```ts
   vi.mocked(uploadPhoto).mockRejectedValue(new PhotoValidationError("File must be an image."));
   ```

5. **For the "disallowed extension" test** (returns 400): Same pattern — throw `PhotoValidationError`.

6. **For the "uploads successfully" test** (returns 201):
   ```ts
   vi.mocked(uploadPhoto).mockResolvedValue({ id: "test-id", url: "http://img.jpg" });
   ```

7. **For the "503 when storage not configured" test**: Have `uploadPhoto` throw an Error containing "not configured":
   ```ts
   vi.mocked(uploadPhoto).mockRejectedValue(new Error("Storage not configured"));
   ```

8. **For the "500 on generic upload error" test**: Already works — keep as-is but ensure `uploadPhoto` throws a generic Error.

**Verification:**
```bash
npx vitest run __tests__/api/photos-upload.test.ts
```

**Acceptance Criteria:**
- All 8 tests in `photos-upload.test.ts` pass
- `npm run test` shows 100% pass rate (486/486)

---

### Issue 2: Fix 20 TypeScript Errors in Test Files

**Root Causes:**
- **A) `admin-messages.test.ts` (4 errors), `admin-music-actions.test.ts` (5 errors), `apple-music-import.test.ts` (4 errors):** Mock `execute()` return type includes `rows: []` and `columns: []` which don't exist on `{ rowsAffected: number; lastInsertRowid: bigint | undefined }`. The real `execute()` at `lib/db/query.ts:32` returns only those two fields.
- **B) `apple-music-import.test.ts` (4 errors):** Mock track objects are missing `album: string` and `durationMs: number` fields. The real `PlaylistTrack` type at `lib/apple-music/formatter.ts:13-18` requires both.
- **C) `weather-forecast.test.tsx` (1 error):** `makeWeatherData` passes `Record<string, unknown>` to `makeHourly` which expects `Partial<Record<string, number>>`.
- **D) `weather-forecast.test.tsx` (1 error):** `afterEach` is used on line 60 but not imported from `vitest`.

**Step-by-Step (Fix A — Remove non-existent properties):**

1. **`__tests__/api/admin-messages.test.ts`** — Remove `rows: [], columns: [], ` from ALL `mockExecute.mockResolvedValue(...)` calls (lines 33, 43, 68, 75, 93). The correct shape is:
   ```ts
   mockExecute.mockResolvedValue({ rowsAffected: 1, lastInsertRowid: undefined });
   ```

2. **`__tests__/api/admin-music-actions.test.ts`** — Same removal on lines 26, 35, 55, 64, 76, 87.

3. **`__tests__/api/apple-music-import.test.ts`** — Same removal on line 123 (and 151 if present). Both mock execute calls need `rows` and `columns` removed.

**Step-by-Step (Fix B — Complete mock objects):**

4. **`__tests__/api/apple-music-import.test.ts`** — Add `album` and `durationMs` to mock track objects:
   ```ts
   // Line 114-116: Change from
   { songName: "Song A", artist: "Artist A" },
   // To
   { songName: "Song A", artist: "Artist A", album: "Album A", durationMs: 210000 },
   ```
   Apply to all three mock tracks (lines 114, 115, 116) and the two in the second test block (lines 147, 148).

**Step-by-Step (Fix C — Type compatibility):**

5. **`__tests__/components/weather-forecast.test.tsx`** — Change the `overrides` parameter type in `makeWeatherData` from `Record<string, unknown>` to `Partial<Record<string, number>>`:
   ```ts
   // Line 28: Change from
   function makeWeatherData(overrides: Record<string, unknown> = {}) {
   // To
   function makeWeatherData(overrides: Partial<Record<string, number>> = {}) {
   ```

**Step-by-Step (Fix D — Missing import):**

6. **`__tests__/components/weather-forecast.test.tsx`** — Add `afterEach` to the vitest import on line 1:
   ```ts
   // Line 1: Change from
   import { describe, it, expect, vi, beforeEach } from "vitest";
   // To
   import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
   ```

**Verification:**
```bash
npm run typecheck
```

**Acceptance Criteria:**
- `npx tsc --noEmit` exits with code 0 (zero errors)
- All test files pass type checking

---

### Issue 3: Add Vitest to CI Pipeline

**Target File:** `.github/workflows/ci.yml`

**Step-by-Step:**

1. **Add a new `test` job** after the existing `build` job in `ci.yml`. It should:
   - Run on `ubuntu-latest`
   - Use `actions/checkout@v4` and `actions/setup-node@v4` (node 20, npm cache)
   - Run `npm ci`
   - Copy `.env.example` to `.env` with placeholder values so the build doesn't fail
   - Run `npx prisma generate` (needed for @prisma/client types in tests)
   - Run `npm run test`

2. **Make the `build` job depend on `test`** (optional but recommended — change `needs: [lint-and-typecheck]` to `needs: [lint-and-typecheck, test]`)

**Exact addition to ci.yml** (insert after the `build` job):
```yaml
  test:
    name: Unit Tests
    needs: [lint-and-typecheck]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Create test environment
        run: |
          echo "DATABASE_URL=file:./prisma/dev.db" >> .env
          echo "NEXTAUTH_SECRET=test-secret-do-not-use-in-prod" >> .env
          echo "NEXTAUTH_URL=http://localhost:3000" >> .env
          echo "ADMIN_EMAIL=test@example.com" >> .env
          echo "ADMIN_PASSWORD=testpassword" >> .env

      - name: Run unit tests
        run: npm run test
```

**Verification:**
```bash
# Locally (cannot fully verify GitHub Actions locally, but can verify the test command works):
npm run test
```

**Acceptance Criteria:**
- CI workflow includes a `test` job that runs `npm run test`
- CI pipeline fails if any test fails (including future regressions)

---

## Phase 2: Medium Priority (documentation + simplification)

---

### Issue 4: Update Architecture Documentation

**Target Files:**
- `docs/ARCHITECTURE.md` — primary doc with stale numbers
- `docs/decisions/feature-flags.md` — flag count outdated

**Step-by-Step:**

1. **`docs/ARCHITECTURE.md` changes:**
   - Line ~8: Change "20 models" → "23 models"
   - Line ~1 (Data Models section): Remove "PhotoTag" from the missing list (it exists now)
   - Lines mentioning "Event bus": Remove all references to `lib/events/` and the event bus — it doesn't exist
   - Line referencing "Event bus has subscribers but unclear if any are wired up in prod" → Remove entirely

2. **`docs/decisions/feature-flags.md` changes:**
   - Title/heading: Change "19 runtime-toggleable" → "21 runtime-toggleable"
   - Add missing flags to the table: `guestPhotoSharingEnabled`, `liveGuestCountEnabled`, `massEmailEnabled`, `photosOfUsPageEnabled`, `timelineEnabled`
   - Update the flag count description

**Verification:**
```bash
# Manual review of both files — no automated verification possible
```

**Acceptance Criteria:**
- ARCHITECTURE.md correctly states "23 models"
- ARCHITECTURE.md has zero references to a non-existent event bus
- feature-flags.md correctly states "21 flags" and lists them all

---

### Issue 5: Extract Travel Content to Data File

**Decision:** Extract to a JSON data file (not a database migration) as a pragmatic first step. A full DB migration with admin UI is a larger project. This at least separates data from logic and makes it easier to transition to DB later.

**Target Files:**
- `lib/config/travel-content.ts` — 533 lines to be split
- NEW: `lib/config/travel-content.data.json` — extracted data
- `app/(public)/travel/page.tsx` — update import path if needed

**Step-by-Step:**

1. **Transcribe all static data** from `lib/config/travel-content.ts` into a new `lib/config/travel-content.data.json` file. The JSON structure should mirror the existing TypeScript interfaces:
   ```json
   {
     "airports": [ ... ],
     "transportOptions": [ ... ],
     "railOrDriveOptions": [ ... ],
     "featuredParks": [ ... ],
     "themeParks": [ ... ],
     "restaurants": [ ... ]
   }
   ```

2. **Keep the TypeScript interfaces** in `travel-content.ts` for type safety, but replace the hardcoded arrays with imports from the JSON file:
   ```ts
   import travelData from "./travel-content.data.json";
   
   export const airports: Airport[] = travelData.airports;
   export const transportOptions: TransportOption[] = travelData.transportOptions;
   // ... etc
   ```

3. **Add type assertion** to validate the JSON shape at import time (optional but recommended):
   ```ts
   import rawData from "./travel-content.data.json";
   const travelData = rawData as {
     airports: Airport[];
     transportOptions: TransportOption[];
     // ...
   };
   ```

4. **Verify the travel page** renders identically by spot-checking locally.

**Decision note:** This is a minimal step — the content is still hardcoded in a file. Moving to a database with an admin CRUD interface is a Phase 4 effort requiring a new model, API routes, and admin page. The JSON file approach at least separates concerns.

**Verification:**
```bash
npm run typecheck && npm run build
# Then manually browse http://localhost:3000/travel
```

**Acceptance Criteria:**
- Travel data lives in a separate `.json` file
- `travel-content.ts` contains only interfaces and re-exports (under ~80 lines)
- Travel page renders correctly with no visual changes
- TypeScript compiles clean

---

### Issue 6: Verify/Enable Auto-Generated DB Types

**Decision:** The script `scripts/generate-db-types.ts` exists. Run it and compare output to `lib/db-types.ts`. If the generated types are correct, replace the manual file and add generation to the build pipeline.

**Target Files:**
- `scripts/generate-db-types.ts` — existing script
- `lib/db-types.ts` — current manual file (to be replaced or verified)
- `package.json` — to add generation as a pre-build step

**Step-by-Step:**

1. **Run the generation script:**
   ```bash
   npx tsx scripts/generate-db-types.ts
   ```

2. **Inspect the output.** Does it produce a `lib/db-types.ts` that matches the current schema? Does it compile?

3. **If the script works correctly:**
   - Replace `lib/db-types.ts` with the generated version
   - Add `"prebuild": "npm run generate:types"` to `package.json` scripts

4. **If the script is broken or incomplete:**
   - Document what's broken
   - Fix the script to read from `prisma/schema.prisma` and output correct TypeScript interfaces
   - Then proceed with step 3

5. **Verify no imports break:**
   ```bash
   npm run typecheck
   npm run build
   ```

**Verification:**
```bash
npm run generate:types && npm run typecheck && npm run build
```

**Acceptance Criteria:**
- `lib/db-types.ts` is auto-generated from the Prisma schema
- Running `npm run generate:types` produces the file
- TypeScript and build pass with the generated types
- The `prebuild` script runs type generation automatically

---

### Issue 7: Consolidate Apple Music Search Endpoints

**Decision:** Move the shared search logic to a single handler, and have both the public and admin routes re-export it.

**Target Files:**
- `app/api/v1/music/search/route.ts` — public iTunes search
- `app/api/v1/admin/music/apple-music/search/route.ts` — admin iTunes search
- NEW: `lib/api/shared/music-search.ts` — shared handler (or inline in one route, re-exported)

**Step-by-Step:**

1. **Compare the two route files** to confirm they have identical or near-identical logic. They are both iTunes search proxies.

2. **Extract the shared logic** into a helper function:
   ```ts
   // lib/itunes-search.ts (or extend existing)
   export async function handleMusicSearch(req: NextRequest): Promise<NextResponse> {
     // The common search logic
   }
   ```

3. **Update both route files** to call the shared handler:
   ```ts
   // app/api/v1/music/search/route.ts
   export { handleMusicSearch as GET } from "@/lib/itunes-search";
   
   // app/api/v1/admin/music/apple-music/search/route.ts  
   // Apply admin auth check, then delegate to handleMusicSearch
   ```

4. **Optionally, add an auth gate** to the admin endpoint only (the public one already has rate limiting).

**Verification:**
```bash
npm run typecheck && npm run test
# Manually test both endpoints:
# curl http://localhost:3000/api/v1/music/search?term=test
# curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/admin/music/apple-music/search?term=test
```

**Acceptance Criteria:**
- Only one search implementation exists
- Both public and admin endpoints work identically
- Admin endpoint still requires authentication
- All existing tests pass

---

## Phase 3: Low Priority (optimizations + cleanup)

---

### Issue 8: Pin Zod to v3

**Target File:** `package.json`

**Step-by-Step:**

1. **Check if the codebase uses any Zod v4-specific APIs:**
   ```bash
   Select-String -Path "lib\**\*.ts","app\**\*.ts","app\**\*.tsx" -Pattern "from \"zod\""
   ```

2. **If no v4-specific APIs are used**, pin to v3:
   ```json
   "zod": "^3.23.8"
   ```

3. **Reinstall:**
   ```bash
   npm install zod@^3.23.8
   ```

4. **Verify:**
   ```bash
   npm run typecheck && npm run build && npm run test
   ```

**Acceptance Criteria:**
- `package.json` lists `"zod": "^3.23.8"` (not v4)
- All existing functionality works

---

### Issue 9: Bump TypeScript Target to ES2020

**Target Files:**
- `tsconfig.json`

**Step-by-Step:**

1. **Change `target`** in `tsconfig.json`:
   ```json
   "target": "ES2020"
   ```

2. **Verify** that no code relies on ES2017-specific behavior (unlikely — ES2020 is a superset):
   ```bash
   npm run typecheck && npm run build && npm run test
   ```

**Acceptance Criteria:**
- `tsconfig.json` target is ES2020
- Full build and test suite pass

---

### Issue 10: Resolve Git Dubious Ownership

**Target:** System configuration, not a project file.

**Step-by-Step:**

1. **Run the safe directory command:**
   ```bash
   git config --global --add safe.directory C:/Users/JSCam/Documents/Development/wedding_website
   ```

2. **Verify git works:**
   ```bash
   git status
   git log --oneline -5
   ```

**Acceptance Criteria:**
- `git status` runs without "dubious ownership" error
- Git operations work from the current execution context

---

### Issue 11: Event Bus — Remove from Docs or Implement

**Decision:** Remove from docs. There is no event bus implementation, no `lib/events/` directory, and no current need for one. If a pub/sub pattern is needed later, it can be added then with proper documentation.

**Target Files:**
- `docs/ARCHITECTURE.md` — covered in Issue 4 above

**Verification:**
```bash
# Manual check — no references to "event bus" should remain in docs/ or lib/
```

**Acceptance Criteria:**
- Zero references to "event bus" in documentation
- If future implementation occurs, new docs will be written for it

---

### Issue 12: Audit Unused Email/Webhook Models

**Decision:** Keep the models (they're in the schema and don't hurt anything) but document their status. No code changes needed for this item.

**Review finding:**
- `EmailTemplate` + `EmailCampaign` + `EmailLog`: Models exist, seed script may populate templates. The admin Communications page exists (`app/admin/communications/`). The email system appears partially implemented — templates can be managed, campaigns can be created, but actual sending relies on `EMAIL_PROVIDER=noop`.
- `WebhookLog` + `IntegrationConfig`: Models exist. No admin UI found. No consumers found. These appear to be placeholders for future features.
- `RegistryContribution`: Connected to `RegistryItem` and has an API endpoint at `app/api/v1/registry/contribute/` and an admin contributions route. This appears implemented.

**Recommended action:** None for now. These models are non-destructive. If the project moves past the wedding and is archived, they could be pruned to reduce schema complexity.

**Acceptance Criteria:**
- Documented status of each model (see table in audit)
- No code changes required

---

## Execution Order Summary

```
Phase 1 (High — do first):
  1. Fix photos-upload.test.ts (Issue 1)
  2. Fix 20 TSC errors (Issue 2)  
  3. Add Vitest to CI (Issue 3)
  → Verify: npm run typecheck && npm run test && npm run build

Phase 2 (Medium — do after Phase 1):
  4. Update docs (Issue 4)
  5. Extract travel content (Issue 5)
  6. Auto-generate db-types (Issue 6)
  7. Consolidate Apple Music search (Issue 7)
  → Verify: npm run typecheck && npm run test && npm run build

Phase 3 (Low — do last):
  8. Pin Zod to v3 (Issue 8)
  9. Bump TS target to ES2020 (Issue 9)
  10. Fix git dubious ownership (Issue 10)
  11. Remove event bus from docs (Issue 11 — covered by Issue 4)
  12. Document model status (Issue 12 — docs-only)
  → Verify: npm run typecheck && npm run test && npm run build
```

## Estimated Effort

| Phase | Issues | Est. Time |
|-------|--------|-----------|
| Phase 1 | 3 issues | 1-2 hours |
| Phase 2 | 4 issues | 2-4 hours |
| Phase 3 | 5 issues | 30 min – 1 hour |
| **Total** | **12 issues** | **4-7 hours** |
