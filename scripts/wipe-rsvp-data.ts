#!/usr/bin/env npx tsx

/**
 * Wipe all RSVP data — reset guests to "pending" and clear related tables.
 *
 * Usage:
 *   npx tsx scripts/wipe-rsvp-data.ts --yes
 *
 * Safety:
 *   - Refuses to run against Turso unless WIPE_ALLOW_PRODUCTION=true
 *   - Prints affected counts before touching any data
 *   - Requires --yes flag to confirm
 *   - Runs in a transaction (all-or-nothing)
 */

import "dotenv/config";
import { createClient } from "@libsql/client";

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

async function wipe() {
  if (process.env.TURSO_DATABASE_URL && process.env.WIPE_ALLOW_PRODUCTION !== "true") {
    console.error(
      "❌ REFUSING TO WIPE PRODUCTION DATABASE. Set WIPE_ALLOW_PRODUCTION=true to proceed."
    );
    process.exit(1);
  }

  // 1. Print what will be affected
  const totalGuests = await client.execute("SELECT COUNT(*) as cnt FROM Guest");
  const totalCnt = Number(totalGuests.rows[0].cnt);

  const rsvpGuests = await client.execute(
    "SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus != 'pending'"
  );
  const rsvpCnt = Number(rsvpGuests.rows[0].cnt);

  const songRequests = await client.execute("SELECT COUNT(*) as cnt FROM SongRequest");
  const songCnt = Number(songRequests.rows[0].cnt);

  const emailLogs = await client.execute("SELECT COUNT(*) as cnt FROM EmailLog");
  const emailLogCnt = Number(emailLogs.rows[0].cnt);

  console.log("\n📊 Current state:");
  console.log(`   Total guests:       ${totalCnt}`);
  console.log(`   RSVP'd guests:      ${rsvpCnt} (will be reset to pending)`);
  console.log(`   SongRequest rows:   ${songCnt} (will be deleted)`);
  console.log(`   EmailLog rows:      ${emailLogCnt} (will be deleted)`);
  console.log("");

  if (!process.argv.includes("--yes")) {
    console.log("Run with --yes to confirm\n");
    process.exit(0);
  }

  // 2. Execute inside a transaction
  console.log("🧹 Wiping RSVP data...");
  await client.execute("BEGIN TRANSACTION");

  try {
    await client.execute(`UPDATE Guest SET
      rsvpStatus = 'pending',
      rsvpRespondedAt = NULL,
      rsvpSubmittedAt = NULL,
      email = NULL,
      phone = NULL,
      dietaryNeeds = NULL,
      plusOneName = NULL,
      plusOneAttending = 0,
      danceSong = NULL,
      firstDanceSong = NULL,
      songRequest = NULL,
      updatedAt = datetime('now')`);

    await client.execute("DELETE FROM SongRequest");
    await client.execute("DELETE FROM EmailLog");
    await client.execute("DELETE FROM EmailCampaign WHERE name = 'RSVP Reminder'");

    await client.execute("COMMIT");

    console.log(`✅ ${rsvpCnt} guest(s) reset to pending`);
    console.log(`✅ ${songCnt} song request(s) deleted`);
    console.log(`✅ ${emailLogCnt} email log(s) deleted`);
    console.log("\n🎉 RSVP data wipe complete!\n");
  } catch (err) {
    await client.execute("ROLLBACK");
    console.error("❌ Transaction rolled back due to error:", err);
    process.exit(1);
  }
}

wipe()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
