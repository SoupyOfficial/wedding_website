import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const dressCode =
    "Creative Cocktail meets Celestial Formal\n\nDress your best and go as crazy as you like to fit the celestial theme. Dressing on theme is encouraged but NOT required. No cream or ivory. No casual wear. The ceremony is outdoors — keep an eye on the weather.";

  await client.execute({
    sql: `UPDATE SiteSettings SET dressCode = ? WHERE id = 'singleton'`,
    args: [dressCode],
  });

  console.log("✅ Dress code updated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
