/**
 * Cleanup script for duplicate WeddingPartyMember rows.
 *
 * Problem: A prior bug (now fixed) created duplicate bridal party members.
 * This script removes duplicates, keeping the earliest-created row in each
 * (name, role, side) group.
 *
 * Usage:
 *   npx tsx scripts/cleanup-wedding-party-duplicates.ts
 *
 * Safety:
 *   - Runs in a transaction (all-or-nothing)
 *   - Prints what will be deleted before deleting
 *   - Uses MIN(createdAt) to keep the oldest row (cuids are not sequential)
 */

import { createClient } from "@libsql/client";

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "file:prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

async function cleanup() {
  // 1. Find duplicate groups
  const duplicates = await client.execute({
    sql: `SELECT name, role, side, COUNT(*) as cnt
          FROM WeddingPartyMember
          GROUP BY name, role, side
          HAVING cnt > 1`,
    args: [],
  });

  if (duplicates.rows.length === 0) {
    console.log("✅ No duplicates found. Nothing to clean up.");
    return;
  }

  console.log(`⚠️  Found ${duplicates.rows.length} duplicate group(s):`);
  for (const row of duplicates.rows) {
    console.log(
      `   - "${row.name}" (${row.role}, ${row.side}): ${row.cnt} copies`
    );
  }

  // 2. Show which rows will be kept vs deleted
  const toDelete = await client.execute({
    sql: `SELECT wpm.id, wpm.name, wpm.role, wpm.side, wpm.createdAt
          FROM WeddingPartyMember wpm
          WHERE wpm.createdAt > (
            SELECT MIN(createdAt)
            FROM WeddingPartyMember wpm2
            WHERE wpm2.name = wpm.name
              AND wpm2.role = wpm.role
              AND wpm2.side = wpm.side
          )`,
    args: [],
  });

  console.log(`\n🗑️  Rows to delete (${toDelete.rows.length} total):`);
  for (const row of toDelete.rows) {
    console.log(
      `   - id=${row.id} | ${row.name} (${row.role}, ${row.side}) | createdAt=${row.createdAt}`
    );
  }

  // 3. Execute deletion inside a transaction
  console.log("\n🧹 Deleting duplicates...");
  await client.execute("BEGIN TRANSACTION");

  try {
    const result = await client.execute({
      sql: `DELETE FROM WeddingPartyMember
            WHERE id IN (
              SELECT wpm.id
              FROM WeddingPartyMember wpm
              WHERE wpm.createdAt > (
                SELECT MIN(createdAt)
                FROM WeddingPartyMember wpm2
                WHERE wpm2.name = wpm.name
                  AND wpm2.role = wpm.role
                  AND wpm2.side = wpm.side
              )
            )`,
      args: [],
    });

    await client.execute("COMMIT");
    console.log(`✅ Deleted ${result.rowsAffected} duplicate row(s).`);
  } catch (err) {
    await client.execute("ROLLBACK");
    console.error("❌ Transaction rolled back due to error:", err);
    process.exit(1);
  }

  // 4. Verify
  const remaining = await client.execute({
    sql: `SELECT COUNT(*) as cnt FROM WeddingPartyMember`,
    args: [],
  });
  console.log(`📊 Remaining WeddingPartyMember rows: ${remaining.rows[0].cnt}`);
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
