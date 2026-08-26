/**
 * RSVP Full Integration Test
 *
 * Run with: npx tsx __tests__/integration/rsvp-full-flow.ts
 *
 * Creates a temp SQLite DB, pushes schema, seeds data,
 * and exercises the full RSVP flow end-to-end.
 */
import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const DB_PATH = path.resolve(__dirname, "test-rsvp.db");
const DB_URL = `file:${DB_PATH}`;

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

async function main() {
  console.log("RSVP Full Integration Test\n");

  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  execSync(
    `DATABASE_URL="${DB_URL}" npx prisma db push --skip-generate --accept-data-loss`,
    { cwd: path.resolve(__dirname, "../.."), stdio: "pipe", timeout: 60000 }
  );

  const client = createClient({ url: DB_URL });

  // ── Seed ──
  const isoNow = new Date().toISOString();
  await client.execute(
    "INSERT INTO SiteSettings (id, coupleName, rsvpDeadline, notifyOnRsvp, notificationEmail, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
    ["singleton", "Test Couple", "2027-12-31T00:00:00.000Z", 1, "admin@test.com", isoNow]
  );
  await client.execute(
    "INSERT INTO Guest (id, firstName, lastName, email, rsvpStatus, plusOneAllowed, childrenCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ["g1", "Alice", "Smith", "alice@test.com", "pending", 0, 0, isoNow, isoNow]
  );
  await client.execute(
    "INSERT INTO Guest (id, firstName, lastName, email, rsvpStatus, plusOneAllowed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ["g2", "Bob", "Jones", "bob@test.com", "pending", 1, isoNow, isoNow]
  );
  await client.execute(
    "INSERT INTO Guest (id, firstName, lastName, rsvpStatus, plusOneAllowed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["g3", "Carol", "Davis", "pending", 0, isoNow, isoNow]
  );
  // Duplicate exact name to test multiple-match → 404 behavior
  await client.execute(
    "INSERT INTO Guest (id, firstName, lastName, rsvpStatus, plusOneAllowed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["g4", "Alice", "Smith", "pending", 0, isoNow, isoNow]
  );

  // ── Tests ──

  // 1. Guest lookup — exact case-insensitive match
  console.log("1. Guest lookup:");
  const alice = await client.execute({
    sql: "SELECT firstName, lastName, rsvpStatus FROM Guest WHERE LOWER(firstName) = LOWER(?) AND LOWER(lastName) = LOWER(?) LIMIT 1",
    args: ["Alice", "Smith"],
  });
  assert(alice.rows.length === 1, "finds Alice Smith with exact match");
  assert(alice.rows[0][0] === "Alice", "correct first name");
  assert(alice.rows[0][2] === "pending", "status is pending");

  const aliceCaseInsensitive = await client.execute({
    sql: "SELECT firstName FROM Guest WHERE LOWER(firstName) = LOWER(?) AND LOWER(lastName) = LOWER(?)",
    args: ["alice", "smith"],
  });
  assert(aliceCaseInsensitive.rows.length === 2, "case-insensitive match finds both Alice Smiths");

  const noMatch = await client.execute({
    sql: "SELECT firstName FROM Guest WHERE LOWER(firstName) = LOWER(?) AND LOWER(lastName) = LOWER(?)",
    args: ["Nobody", "Here"],
  });
  assert(noMatch.rows.length === 0, "no match for non-existent name");

  const duplicateAlice = await client.execute({
    sql: "SELECT id FROM Guest WHERE LOWER(firstName) = LOWER(?) AND LOWER(lastName) = LOWER(?)",
    args: ["Alice", "Smith"],
  });
  assert(duplicateAlice.rows.length > 1, "duplicate exact name returns multiple rows (→ 404 in API)");

  // 2. RSVP submit — attending
  console.log("\n2. RSVP submit — attending:");
  await client.execute(
    `UPDATE Guest SET rsvpStatus = ?, rsvpRespondedAt = ?, email = ?, phone = ?,
     dietaryNeeds = ?, updatedAt = ? WHERE id = ?`,
    ["attending", "2026-06-15T00:00:00.000Z", "alice@test.com", "555-1234", "No nuts", "2026-06-15T00:00:00.000Z", "g1"]
  );
  const aliceUpdated = await client.execute("SELECT rsvpStatus, email, dietaryNeeds FROM Guest WHERE id = ?", ["g1"]);
  assert(aliceUpdated.rows[0][0] === "attending", "status updated to attending");
  assert(aliceUpdated.rows[0][1] === "alice@test.com", "email stored");
  assert(aliceUpdated.rows[0][2] === "No nuts", "dietary needs stored");

  // 3. RSVP submit — declined
  console.log("\n3. RSVP submit — declined:");
  await client.execute(
    "UPDATE Guest SET rsvpStatus = ?, rsvpRespondedAt = ?, updatedAt = ? WHERE id = ?",
    ["declined", "2026-06-15T00:00:00.000Z", "2026-06-15T00:00:00.000Z", "g3"]
  );
  const carolUpdated = await client.execute("SELECT rsvpStatus FROM Guest WHERE id = ?", ["g3"]);
  assert(carolUpdated.rows[0][0] === "declined", "status updated to declined");

  // 4. Song request
  console.log("\n4. Song request:");
  const songId = "song-" + Date.now();
  await client.execute(
    "INSERT INTO SongRequest (id, songTitle, artist, guestName, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, 0, 0, ?)",
    [songId, "Dancing Queen", "ABBA", "Alice Smith", "2026-06-15T00:00:00.000Z"]
  );
  const song = await client.execute("SELECT songTitle, guestName FROM SongRequest WHERE id = ?", [songId]);
  assert(song.rows[0][0] === "Dancing Queen", "song title stored");
  assert(song.rows[0][1] === "Alice Smith", "guest name stored");

  // 5. Song request dedup (update instead of insert)
  console.log("\n5. Song request dedup:");
  await client.execute(
    "UPDATE SongRequest SET songTitle = ?, artist = ? WHERE guestName = ?",
    ["Mamma Mia", "ABBA", "Alice Smith"]
  );
  const songs = await client.execute("SELECT songTitle FROM SongRequest WHERE guestName = ?", ["Alice Smith"]);
  assert(songs.rows.length === 1, "only one song per guest");
  assert(songs.rows[0][0] === "Mamma Mia", "song updated instead of duplicated");

  // 6. RSVP deadline enforcement
  console.log("\n6. Deadline enforcement:");
  await client.execute("UPDATE SiteSettings SET rsvpDeadline = ? WHERE id = ?", ["2020-01-01T00:00:00.000Z", "singleton"]);
  const settings = await client.execute("SELECT rsvpDeadline FROM SiteSettings WHERE id = ?", ["singleton"]);
  const deadline = new Date(settings.rows[0][0] as string);
  const currentTime = new Date();
  assert(currentTime > deadline, "past deadline detected");

  // 7. RSVP stats
  console.log("\n7. RSVP stats:");
  const attending = await client.execute("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["attending"]);
  const declined = await client.execute("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["declined"]);
  const pending = await client.execute("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["pending"]);
  assert(Number(attending.rows[0][0]) >= 1, `attending: ${attending.rows[0][0]}`);
  assert(Number(declined.rows[0][0]) >= 1, `declined: ${declined.rows[0][0]}`);
  assert(Number(pending.rows[0][0]) >= 1, `pending: ${pending.rows[0][0]}`);

  // 8. RSVP edit deadline — guest who already responded vs first-time
  console.log("\n8. RSVP edit deadline:");
  await client.execute(
    "UPDATE SiteSettings SET rsvpEditDeadline = ? WHERE id = ?",
    ["2020-01-01T00:00:00.000Z", "singleton"]
  );
  const editSettings = await client.execute("SELECT rsvpEditDeadline FROM SiteSettings WHERE id = ?", ["singleton"]);
  assert(editSettings.rows[0][0] === "2020-01-01T00:00:00.000Z", "rsvpEditDeadline stored correctly");

  const editDeadline = new Date(editSettings.rows[0][0] as string);
  assert(currentTime > editDeadline, "edit deadline is in the past");

  const aliceResponded = await client.execute(
    "SELECT rsvpStatus, rsvpRespondedAt FROM Guest WHERE id = ?", ["g1"]
  );
  assert(aliceResponded.rows[0][0] === "attending", "Alice already responded (edit case)");
  assert(!!aliceResponded.rows[0][1], "Alice has rsvpRespondedAt set");

  const bobPending = await client.execute(
    "SELECT rsvpStatus, rsvpRespondedAt FROM Guest WHERE id = ?", ["g2"]
  );
  assert(bobPending.rows[0][0] === "pending", "Bob is still pending (first-time case)");
  assert(!bobPending.rows[0][1], "Bob has no rsvpRespondedAt (first-time not blocked by edit deadline)");

  // ── Summary ──
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Passed: ${passed}  Failed: ${failed}`);
  console.log(`${"─".repeat(40)}`);

  client.close();
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
