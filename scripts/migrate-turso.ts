#!/usr/bin/env node

/**
 * Turso Migration Deployer
 *
 * Applies Prisma migration SQL files to a Turso database using @libsql/client.
 * Prisma's built-in `migrate deploy` only works with local SQLite files,
 * so this script fills that gap for Turso/libSQL production databases.
 *
 * Usage:
 *   npx tsx scripts/migrate-turso.ts
 *
 * Required env vars:
 *   TURSO_DATABASE_URL  - e.g. libsql://your-db.turso.io
 *   TURSO_AUTH_TOKEN    - Turso auth token
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error(
      `${RED}${BOLD}Error:${RESET} TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.\n`
    );
    console.error("For local development, use: npm run db:migrate\n");
    process.exit(1);
  }

  console.log(`\n${BOLD}🚀 Deploying migrations to Turso...${RESET}`);
  console.log(`${DIM}   ${tursoUrl}${RESET}\n`);

  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  // Ensure the migrations tracking table exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id                  TEXT PRIMARY KEY NOT NULL,
      checksum            TEXT NOT NULL,
      finished_at         DATETIME,
      migration_name      TEXT NOT NULL,
      logs                TEXT,
      rolled_back_at      DATETIME,
      started_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Get already-applied migrations
  const applied = await client.execute(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL"
  );
  const appliedNames = new Set(applied.rows.map((r) => String(r.migration_name)));

  // Read migration directories (sorted by name = chronological order)
  const migrationDirs = fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let appliedCount = 0;
  let skippedCount = 0;

  for (const dir of migrationDirs) {
    if (appliedNames.has(dir)) {
      skippedCount++;
      continue;
    }

    const sqlFile = path.join(MIGRATIONS_DIR, dir, "migration.sql");
    if (!fs.existsSync(sqlFile)) {
      console.log(`${YELLOW}⚠ Skipping ${dir} (no migration.sql)${RESET}`);
      continue;
    }

    const sql = fs.readFileSync(sqlFile, "utf-8");

    console.log(`${BOLD}→ Applying: ${dir}${RESET}`);

    try {
      // Record migration start
      const id = crypto.randomUUID();
      const checksum = simpleHash(sql);

      await client.execute({
        sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, started_at)
              VALUES (?, ?, ?, datetime('now'))`,
        args: [id, checksum, dir],
      });

      // Split and execute statements (SQLite doesn't support multi-statement exec)
      const statements = splitStatements(sql);
      for (const stmt of statements) {
        await client.execute(stmt);
      }

      // Mark as finished
      await client.execute({
        sql: `UPDATE _prisma_migrations
              SET finished_at = datetime('now'), applied_steps_count = ?
              WHERE id = ?`,
        args: [statements.length, id],
      });

      console.log(`${GREEN}  ✅ Applied (${statements.length} statements)${RESET}`);
      appliedCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${RED}  ❌ Failed: ${message}${RESET}`);

      // Check if the error is because the schema already exists (e.g., tables
      // were created via db push before migrations were adopted)
      if (
        message.includes("already exists") ||
        message.includes("duplicate column")
      ) {
        console.error(
          `${YELLOW}  ℹ This migration may have already been applied outside of the migration system.${RESET}`
        );
        console.error(
          `${YELLOW}  Run: npm run db:deploy:mark ${dir}${RESET}\n`
        );
      }

      process.exit(1);
    }
  }

  console.log(
    `\n${GREEN}${BOLD}✅ Done!${RESET} ${appliedCount} applied, ${skippedCount} already up-to-date.\n`
  );

  client.close();
}

/**
 * Split a SQL file into individual statements, handling Prisma's
 * SQLite migration patterns (PRAGMA, CREATE TABLE, ALTER TABLE, etc.)
 */
function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

/**
 * Simple hash for migration checksum (matches Prisma's approach loosely)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

main().catch((error) => {
  console.error(`${RED}${BOLD}Unexpected error:${RESET}`, error);
  process.exit(1);
});
