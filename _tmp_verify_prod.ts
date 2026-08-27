import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:prisma/prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, ...(authToken ? { authToken } : {}) });

const deleted = ["885624e3-8c35-406b-ac17-64f6fcecd769", "446871f4-6d8d-4936-b91d-78c81782da62"];
const keepers = ["cmloho0nw002t20385u9ghx39", "cmloho4cc003s2038wqe5hug6"];

async function main() {
  const total = await client.execute("SELECT COUNT(*) as cnt FROM Guest");
  console.log("TOTAL GUESTS:", Number(total.rows[0].cnt));

  for (const id of deleted) {
    const r = await client.execute({ sql: "SELECT COUNT(*) as cnt FROM Guest WHERE id = ?", args: [id] });
    console.log(`DELETED_ID ${id} present?`, Number(r.rows[0].cnt) > 0);
  }
  for (const id of keepers) {
    const r = await client.execute({ sql: "SELECT id, firstName, lastName FROM Guest WHERE id = ?", args: [id] });
    console.log(`KEEPER ${id} ->`, JSON.stringify(r.rows));
  }

  const couples = await client.execute("SELECT id, firstName, lastName, email FROM Guest WHERE lastName IN ('Meszaros','Craig') ORDER BY lastName, firstName");
  console.log("COUPLES COUNT:", couples.rows.length);
  for (const row of couples.rows) {
    console.log("  ", row.id, row.firstName, row.lastName, "|", row.email);
  }

  const dangling = await client.execute({
    sql: "SELECT COUNT(*) as cnt FROM EmailLog WHERE guestId IN (?, ?)",
    args: [deleted[0], deleted[1]],
  });
  console.log("EMAILLOG DANGLING (deleted ids):", Number(dangling.rows[0].cnt));

  const keeperLogs = await client.execute({
    sql: "SELECT guestId, COUNT(*) as cnt FROM EmailLog WHERE guestId IN (?, ?) GROUP BY guestId",
    args: [keepers[0], keepers[1]],
  });
  console.log("EMAILLOG for keepers:", JSON.stringify(keeperLogs.rows));
}
main().catch((e) => { console.error(e); process.exit(1); });
