import { createClient } from "@libsql/client";

// Load environment variables from .env
import "dotenv/config";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log("Adding dressCodeImages column to SiteSettings table (Turso production)...");

  await client.execute(
    `ALTER TABLE SiteSettings ADD COLUMN dressCodeImages TEXT NOT NULL DEFAULT ''`
  );

  console.log("✅ dressCodeImages column added to SiteSettings table successfully.");
}

main().catch(console.error);
