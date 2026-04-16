#!/usr/bin/env node

/**
 * Sync remote Turso DB → local SQLite test database.
 *
 * Reads all tables from the remote Turso database and writes them
 * into e2e/test.db so Playwright tests can run against real data
 * without touching production.
 *
 * Usage:
 *   npx tsx e2e/sync-test-db.ts
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const TEST_DB_PATH = path.join(__dirname, "test.db");

// Tables to sync — order matters for foreign keys
const TABLES = [
  "SiteSettings",
  "Guest",
  "WeddingPartyMember",
  "TimelineEvent",
  "Hotel",
  "RegistryItem",
  "FAQ",
  "Photo",
  "PhotoTag",
  "_PhotoToPhotoTag",
  "Entertainment",
  "GuestBookEntry",
  "MealOption",
  "SongRequest",
  "DJList",
  "FeatureFlag",
  "WebhookLog",
  "IntegrationConfig",
  "AdminActivityLog",
  "ContactMessage",
  "EmailTemplate",
  "EmailCampaign",
  "EmailLog",
  "RegistryContribution",
  "_prisma_migrations",
];

/** Strip surrounding quotes that some .env loaders preserve. */
function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, "");
}

async function main() {
  const remoteUrl = process.env.TURSO_DATABASE_URL
    ? stripQuotes(process.env.TURSO_DATABASE_URL)
    : undefined;
  const authToken = process.env.TURSO_AUTH_TOKEN
    ? stripQuotes(process.env.TURSO_AUTH_TOKEN)
    : undefined;

  if (!remoteUrl || !authToken) {
    console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
    process.exit(1);
  }

  console.log("🔄 Syncing remote Turso DB → e2e/test.db ...");

  // Delete old test DB if it exists
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
    // Also remove WAL/SHM files if present
    for (const suffix of ["-wal", "-shm"]) {
      const f = TEST_DB_PATH + suffix;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  }

  const remote = createClient({ url: remoteUrl, authToken });
  const local = createClient({ url: `file:${TEST_DB_PATH}` });

  // Get the full schema from the remote DB
  const schemaRows = await remote.execute(
    "SELECT sql FROM sqlite_master WHERE type IN ('table','index') AND sql IS NOT NULL ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END"
  );

  // Create all tables/indexes locally
  for (const row of schemaRows.rows) {
    const sql = row.sql as string;
    try {
      await local.execute(sql);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Skip "already exists" errors (e.g. sqlite_sequence)
      if (!msg.includes("already exists")) {
        console.warn(`  ⚠ Schema warning: ${msg}`);
      }
    }
  }

  // Copy data for each table
  let totalRows = 0;
  for (const table of TABLES) {
    try {
      const result = await remote.execute(`SELECT * FROM "${table}"`);
      if (result.rows.length === 0) continue;

      const cols = result.columns;
      const placeholders = cols.map(() => "?").join(", ");
      const colList = cols.map((c) => `"${c}"`).join(", ");

      for (const row of result.rows) {
        const values = cols.map((col) => {
          const val = (row as Record<string, unknown>)[col];
          return val === undefined ? null : val;
        });

        await local.execute({
          sql: `INSERT OR REPLACE INTO "${table}" (${colList}) VALUES (${placeholders})`,
          args: values as Array<string | number | null | ArrayBuffer>,
        });
      }

      totalRows += result.rows.length;
      console.log(`  ✅ ${table}: ${result.rows.length} rows`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Table might not exist in remote yet — skip
      if (msg.includes("no such table")) {
        console.log(`  ⏭  ${table}: not found in remote, skipping`);
      } else {
        console.warn(`  ⚠ ${table}: ${msg}`);
      }
    }
  }

  console.log(`\n✅ Synced ${totalRows} rows to e2e/test.db`);

  // Apply any pending migrations that may not be on the remote DB yet.
  // This ensures the test DB always matches the schema expected by the code.
  const migrationsDir = path.resolve(__dirname, "..", "prisma", "migrations");
  if (fs.existsSync(migrationsDir)) {
    const migrationFolders = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    let applied = 0;
    for (const folder of migrationFolders) {
      const sqlFile = path.join(migrationsDir, folder, "migration.sql");
      if (!fs.existsSync(sqlFile)) continue;

      const sql = fs.readFileSync(sqlFile, "utf-8");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          await local.execute(stmt);
          applied++;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          // Ignore "already exists" / "duplicate column" — means the remote already had it
          if (
            msg.includes("already exists") ||
            msg.includes("duplicate column")
          ) {
            continue;
          }
          console.warn(`  ⚠ Migration warning (${folder}): ${msg}`);
        }
      }
    }
    if (applied > 0) {
      console.log(`  📋 Applied ${applied} migration statement(s) to local DB`);
    }
  }

  console.log("");

  remote.close();
  local.close();
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
