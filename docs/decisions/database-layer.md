# Decision: Database Layer

## Choice: Raw SQL via @libsql/client instead of Prisma Client

### Why
- **Turso/libSQL** is the production database (edge-compatible SQLite). Prisma Client doesn't natively support Turso at the time of implementation.
- Prisma is kept **only for schema definition and migration generation** — the SQL files it produces are applied via a custom `scripts/migrate-turso.ts` script.
- Raw SQL gives full control over query optimization with no ORM overhead.

### Tradeoffs Accepted
- **Manual type mapping**: `db-types.ts` (~300 lines) manually mirrors Prisma schema as TypeScript interfaces. These can drift if schema changes without updating types.
- **Boolean conversion**: SQLite stores booleans as 0/1 integers. Every query result needs `toBool()` / `toBoolAll()` applied with field-name constants (`SETTINGS_BOOLS`, `GUEST_BOOLS`, etc). This is repetitive and error-prone.
- **No relation loading**: Prisma's `include` for relations isn't available. JOINs and junction table queries are manual (e.g., Photo ↔ PhotoTag via `_PhotoToPhotoTag`).

### Simplification Candidates
- **Auto-generate db-types.ts** from `schema.prisma` (eliminates 300 lines of manual sync)
- **Migrate to Postgres + Prisma Client** if Turso is no longer a requirement (eliminates toBool pattern entirely, gets relation loading, removes migrate-turso.ts)
- **Create a typed query builder** that wraps toBool conversion per-model (reduces boilerplate in every API route)

### Current File Map
| File | Role |
|------|------|
| `prisma/schema.prisma` | Source of truth for schema |
| `lib/db.ts` | Connection singleton + query/execute/utilities |
| `lib/db-types.ts` | Manual TS interfaces + boolean field constants |
| `scripts/migrate-turso.ts` | Applies Prisma SQL to Turso |
