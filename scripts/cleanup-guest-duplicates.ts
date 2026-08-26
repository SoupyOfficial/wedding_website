/**
 * Cleanup script for duplicate Guest rows.
 *
 * Deduplicates the Guest table by MERGING duplicate rows into a single
 * "keeper" row and DELETING the extra rows.
 *
 * Duplicate rule (matches lib/guest-duplicates.ts):
 *   Two guests are duplicates when
 *     LOWER(TRIM(firstName || ' ' || lastName)) matches, OR
 *     (both emails are non-null AND LOWER(TRIM(email)) matches).
 *   Transitive closure: if A~B and B~C then {A, B, C} is one group.
 *
 * Usage:
 *   npx tsx scripts/cleanup-guest-duplicates.ts              # dry-run
 *   npx tsx scripts/cleanup-guest-duplicates.ts --yes        # commit
 *
 * Production (Turso) — read-only dry-run is always allowed; mutations require
 * DEDUP_ALLOW_PRODUCTION=true:
 *   npx dotenv-cli -e .env -- npx tsx scripts/cleanup-guest-duplicates.ts
 *   DEDUP_ALLOW_PRODUCTION=true npx dotenv-cli -e .env -- npx tsx scripts/cleanup-guest-duplicates.ts --yes
 *
 * Safety:
 *   - Dry-run is the default; nothing is written without --yes
 *   - Refuses to mutate a Turso/libsql http(s) URL unless DEDUP_ALLOW_PRODUCTION=true
 *   - Merges + deletes + EmailLog remaps run in a single transaction
 */

import { createClient } from "@libsql/client";

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "file:prisma/prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const isRemote = /^(libsql|http|https|ws|wss):\/\//i.test(url);
const isYes = process.argv.includes("--yes");

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string | null;
  plusOneAllowed: number | null;
  plusOneName: string | null;
  plusOneAttending: number | null;
  dietaryNeeds: string | null;
  songRequest: string | null;
  danceSong: string | null;
  firstDanceSong: string | null;
  childrenCount: number | null;
  childrenNames: string | null;
  tableNumber: number | null;
  notes: string | null;
  rsvpRespondedAt: string | null;
  rsvpSubmittedAt: string | null;
  inviteToken: string | null;
  createdAt: string;
  updatedAt: string;
}

type TextKey =
  | "email"
  | "phone"
  | "plusOneName"
  | "dietaryNeeds"
  | "songRequest"
  | "danceSong"
  | "firstDanceSong"
  | "childrenNames"
  | "notes"
  | "inviteToken"
  | "rsvpRespondedAt"
  | "rsvpSubmittedAt";

interface MergedValues extends Record<TextKey, string | null> {
  tableNumber: number | null;
  plusOneAllowed: boolean;
  plusOneAttending: boolean;
  childrenCount: number;
  rsvpStatus: string;
}

interface Plan {
  keeper: GuestRow;
  dups: GuestRow[];
  merged: MergedValues;
  changes: string[];
}

class UnionFind {
  private parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }

  find(x: number): number {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[x] !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

function asBool(v: number | string | null): boolean {
  return v === 1 || v === "1";
}

function asInt(v: number | string | null): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isEmptyText(v: string | null): boolean {
  return v === null || v === undefined || v.trim() === "";
}

function nameKey(r: GuestRow): string {
  return `${r.firstName.trim()} ${r.lastName.trim()}`.toLowerCase();
}

function isBetter(a: GuestRow, b: GuestRow): boolean {
  const aRsvp = (a.rsvpStatus ?? "pending") !== "pending";
  const bRsvp = (b.rsvpStatus ?? "pending") !== "pending";
  if (aRsvp !== bRsvp) return aRsvp;

  const aToken = a.inviteToken !== null;
  const bToken = b.inviteToken !== null;
  if (aToken !== bToken) return aToken;

  const aEmail = a.email !== null;
  const bEmail = b.email !== null;
  if (aEmail !== bEmail) return aEmail;

  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt;
  return a.id < b.id;
}

function detectDuplicateGroups(guests: GuestRow[]): GuestRow[][] {
  const n = guests.length;
  const uf = new UnionFind(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nameKey(guests[i]) === nameKey(guests[j])) {
        uf.union(i, j);
      }
    }
  }

  const groups = new Map<number, GuestRow[]>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    const list = groups.get(root);
    if (list) list.push(guests[i]);
    else groups.set(root, [guests[i]]);
  }

  return [...groups.values()].filter((g) => g.length >= 2);
}

function mergeTextField(
  key: TextKey,
  keeperVal: string | null,
  dups: GuestRow[]
): { value: string | null; sourceId: string | null } {
  if (!isEmptyText(keeperVal)) return { value: keeperVal, sourceId: null };
  for (const d of dups) {
    const v = d[key];
    if (!isEmptyText(v)) return { value: v, sourceId: d.id };
  }
  return { value: keeperVal, sourceId: null };
}

function computeMerge(keeper: GuestRow, dups: GuestRow[]): {
  merged: MergedValues;
  changes: string[];
} {
  const changes: string[] = [];
  const fmt = (v: string | null): string =>
    v === null ? "NULL" : v.trim() === "" ? '""' : JSON.stringify(v);

  const textKeys: TextKey[] = [
    "email",
    "phone",
    "plusOneName",
    "dietaryNeeds",
    "songRequest",
    "danceSong",
    "firstDanceSong",
    "childrenNames",
    "notes",
    "inviteToken",
    "rsvpRespondedAt",
    "rsvpSubmittedAt",
  ];

  const text: Record<TextKey, string | null> = {} as Record<TextKey, string | null>;
  for (const key of textKeys) {
    const keeperVal = keeper[key];
    const res = mergeTextField(key, keeperVal, dups);
    text[key] = res.value;
    if (res.sourceId !== null && res.value !== keeperVal) {
      changes.push(`${key}: ${fmt(keeperVal)} -> ${fmt(res.value)} (from ${res.sourceId})`);
    }
  }

  // tableNumber (int): fill only if keeper is null
  let tableNumber = keeper.tableNumber;
  let tableSourceId: string | null = null;
  if (tableNumber === null) {
    for (const d of dups) {
      if (d.tableNumber !== null) {
        tableNumber = d.tableNumber;
        tableSourceId = d.id;
        break;
      }
    }
  }
  if (tableSourceId !== null) {
    changes.push(`tableNumber: NULL -> ${tableNumber} (from ${tableSourceId})`);
  }

  // plusOneAllowed / plusOneAttending: OR
  const keeperPlusOneAllowed = asBool(keeper.plusOneAllowed);
  const keeperPlusOneAttending = asBool(keeper.plusOneAttending);
  const plusOneAllowed =
    keeperPlusOneAllowed || dups.some((d) => asBool(d.plusOneAllowed));
  const plusOneAttending =
    keeperPlusOneAttending || dups.some((d) => asBool(d.plusOneAttending));
  if (plusOneAllowed !== keeperPlusOneAllowed) {
    changes.push(`plusOneAllowed: ${keeperPlusOneAllowed} -> true`);
  }
  if (plusOneAttending !== keeperPlusOneAttending) {
    changes.push(`plusOneAttending: ${keeperPlusOneAttending} -> true`);
  }

  // childrenCount: MAX
  const childrenCount = dups.reduce(
    (max, d) => Math.max(max, asInt(d.childrenCount)),
    asInt(keeper.childrenCount)
  );
  if (childrenCount !== asInt(keeper.childrenCount)) {
    changes.push(`childrenCount: ${asInt(keeper.childrenCount)} -> ${childrenCount}`);
  }

  // rsvpStatus: if keeper pending, take first non-pending from duplicates
  let rsvpStatus = keeper.rsvpStatus ?? "pending";
  let rsvpSourceId: string | null = null;
  if (rsvpStatus === "pending") {
    for (const d of dups) {
      const s = d.rsvpStatus ?? "pending";
      if (s !== "pending") {
        rsvpStatus = s;
        rsvpSourceId = d.id;
        break;
      }
    }
  }
  if (rsvpSourceId !== null) {
    changes.push(`rsvpStatus: pending -> ${rsvpStatus} (from ${rsvpSourceId})`);
  }

  const merged: MergedValues = {
    ...text,
    tableNumber,
    plusOneAllowed,
    plusOneAttending,
    childrenCount,
    rsvpStatus,
  };

  return { merged, changes };
}

function buildPlan(group: GuestRow[]): Plan {
  const keeper = group.reduce((best, r) => (isBetter(r, best) ? r : best));
  const dups = group.filter((r) => r.id !== keeper.id);
  const { merged, changes } = computeMerge(keeper, dups);
  return { keeper, dups, merged, changes };
}

function displayRow(r: GuestRow, marker: string): string {
  const name = `${r.firstName} ${r.lastName}`;
  const token = r.inviteToken ? "present" : "-";
  return `${marker} id=${r.id} | ${name} | email=${r.email ?? "-"} | phone=${r.phone ?? "-"} | rsvp=${r.rsvpStatus ?? "pending"} | token=${token} | createdAt=${r.createdAt} | notes=${r.notes ?? "-"}`;
}

async function updateKeeper(keeper: GuestRow, m: MergedValues): Promise<void> {
  await client.execute({
    sql: `UPDATE Guest SET
      email = ?, phone = ?, plusOneName = ?, dietaryNeeds = ?, songRequest = ?,
      danceSong = ?, firstDanceSong = ?, childrenNames = ?, notes = ?, inviteToken = ?,
      rsvpRespondedAt = ?, rsvpSubmittedAt = ?, tableNumber = ?,
      plusOneAllowed = ?, plusOneAttending = ?, childrenCount = ?, rsvpStatus = ?,
      updatedAt = datetime('now')
      WHERE id = ?`,
    args: [
      m.email,
      m.phone,
      m.plusOneName,
      m.dietaryNeeds,
      m.songRequest,
      m.danceSong,
      m.firstDanceSong,
      m.childrenNames,
      m.notes,
      m.inviteToken,
      m.rsvpRespondedAt,
      m.rsvpSubmittedAt,
      m.tableNumber,
      m.plusOneAllowed ? 1 : 0,
      m.plusOneAttending ? 1 : 0,
      m.childrenCount,
      m.rsvpStatus,
      keeper.id,
    ],
  });
}

async function main(): Promise<void> {
  if (isYes && isRemote && process.env.DEDUP_ALLOW_PRODUCTION !== "true") {
    console.error(
      "❌ REFUSING TO MUTATE PRODUCTION DATABASE (Turso/libsql URL).\n" +
        "   Set DEDUP_ALLOW_PRODUCTION=true to proceed with --yes.\n" +
        `   Resolved URL: ${url}`
    );
    process.exit(1);
  }

  console.log(`Database: ${url} (${isRemote ? "remote" : "local"})`);
  console.log(`Mode: ${isYes ? "COMMIT" : "DRY-RUN"}\n`);

  const totalResult = await client.execute("SELECT COUNT(*) as cnt FROM Guest");
  const totalGuests = Number(totalResult.rows[0].cnt);
  console.log(`Total guests: ${totalGuests}`);

  const result = await client.execute("SELECT * FROM Guest");
  const guests = result.rows as unknown as GuestRow[];

  const groups = detectDuplicateGroups(guests);

  if (groups.length === 0) {
    console.log("✅ No duplicate groups found. Nothing to do.");
    return;
  }

  // EmailLog counts per guestId, for remap reporting.
  const emailLogResult = await client.execute(
    "SELECT guestId, COUNT(*) as cnt FROM EmailLog GROUP BY guestId"
  );
  const emailLogMap = new Map<string, number>();
  for (const row of emailLogResult.rows) {
    emailLogMap.set(String(row.guestId), Number(row.cnt));
  }

  const plans = groups.map(buildPlan);
  const deleteCount = plans.reduce((sum, p) => sum + p.dups.length, 0);

  console.log(`\n⚠️  Found ${groups.length} duplicate group(s), ${deleteCount} row(s) to delete.\n`);

  plans.forEach((p, i) => {
    console.log(`─ Group ${i + 1} ─`);
    console.log(`  👑 KEEPER:`);
    console.log(`     ${displayRow(p.keeper, "")}`);
    console.log(`  Duplicates:`);
    for (const d of p.dups) {
      console.log(`     ${displayRow(d, "")}`);
    }
    console.log(`  Merge plan:`);
    if (p.changes.length === 0) {
      console.log(`     (no field changes needed — duplicates add nothing)`);
    } else {
      for (const c of p.changes) {
        console.log(`     • ${c}`);
      }
    }
    console.log(`  Delete: ${p.dups.map((d) => d.id).join(", ")}`);
    for (const d of p.dups) {
      const remaps = emailLogMap.get(d.id) ?? 0;
      console.log(`  EmailLog remap: ${d.id} -> ${p.keeper.id} (${remaps} row(s))`);
    }
    console.log("");
  });

  if (!isYes) {
    console.log(
      `Would merge ${groups.length} group(s), delete ${deleteCount} row(s). Run with --yes to commit.`
    );
    return;
  }

  console.log("🧹 Merging and deleting duplicates...");
  await client.execute("BEGIN TRANSACTION");

  let committed = false;
  try {
    for (const p of plans) {
      for (const d of p.dups) {
        await client.execute({
          sql: "DELETE FROM Guest WHERE id = ?",
          args: [d.id],
        });
        await client.execute({
          sql: "UPDATE EmailLog SET guestId = ? WHERE guestId = ?",
          args: [p.keeper.id, d.id],
        });
      }
      await updateKeeper(p.keeper, p.merged);
    }
    await client.execute("COMMIT");
    committed = true;
  } catch (err) {
    if (!committed) {
      await client.execute("ROLLBACK");
    }
    console.error("❌ Transaction rolled back due to error:", err);
    process.exit(1);
  }

  const afterResult = await client.execute("SELECT COUNT(*) as cnt FROM Guest");
  const afterGuests = Number(afterResult.rows[0].cnt);
  console.log(`\n📊 Guest count before: ${totalGuests} → after: ${afterGuests}`);
  console.log(`✅ Merged ${groups.length} group(s), deleted ${deleteCount} row(s).`);

  // Verify: re-run detection, assert zero duplicate groups remain.
  const verifyResult = await client.execute("SELECT * FROM Guest");
  const remaining = verifyResult.rows as unknown as GuestRow[];
  const remainingGroups = detectDuplicateGroups(remaining);
  if (remainingGroups.length === 0) {
    console.log("VERIFY: 0 duplicate groups remain");
  } else {
    console.error(
      `❌ VERIFY FAILED: ${remainingGroups.length} duplicate group(s) remain after cleanup.`
    );
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
