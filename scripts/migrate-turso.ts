/**
 * Applies Prisma migration SQL files to a Turso/libSQL database.
 * Tracks applied migrations in a `_prisma_migrations` table.
 *
 * Usage: npx tsx scripts/migrate-turso.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.
 * Skips gracefully if they are not set (local dev uses SQLite file).
 */
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const MIGRATIONS_DIR = join(__dirname, "..", "prisma", "migrations");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log("⏭  TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not set — skipping Turso migration.");
    process.exit(0);
  }

  const client = createClient({ url, authToken });

  // Ensure migrations tracking table exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id TEXT PRIMARY KEY,
      migration_name TEXT NOT NULL UNIQUE,
      finished_at TEXT NOT NULL DEFAULT (datetime('now')),
      applied_steps_count INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Get already-applied migrations
  const applied = await client.execute("SELECT migration_name FROM _prisma_migrations");
  const appliedSet = new Set(applied.rows.map((r) => r.migration_name as string));

  // Read migration directories (sorted chronologically by name)
  const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let appliedCount = 0;

  for (const dir of dirs) {
    if (appliedSet.has(dir)) {
      continue;
    }

    const sqlPath = join(MIGRATIONS_DIR, dir, "migration.sql");
    if (!existsSync(sqlPath)) {
      console.log(`⚠  No migration.sql in ${dir}, skipping.`);
      continue;
    }

    const sql = readFileSync(sqlPath, "utf-8");

    // Split on semicolons, filter empty, execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`▶  Applying migration: ${dir} (${statements.length} statements)`);

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // Tolerate "already exists" errors for idempotency
        if (
          message.includes("already exists") ||
          message.includes("duplicate column")
        ) {
          console.log(`   ⚠  Skipped (already exists): ${stmt.slice(0, 80)}...`);
          continue;
        }
        console.error(`   ✖  Failed: ${stmt.slice(0, 120)}`);
        throw err;
      }
    }

    // Record the migration
    await client.execute({
      sql: "INSERT INTO _prisma_migrations (id, migration_name) VALUES (?, ?)",
      args: [randomUUID(), dir],
    });

    appliedCount++;
    console.log(`   ✔  Applied: ${dir}`);
  }

  if (appliedCount === 0) {
    console.log("✔  All migrations already applied.");
  } else {
    console.log(`✔  Applied ${appliedCount} migration(s).`);
  }

  client.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
