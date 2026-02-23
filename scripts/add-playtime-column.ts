import { createClient } from "@libsql/client";

// Load environment variables from .env
import "dotenv/config";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log("Adding playTime column to DJList table...");

  await client.execute(
    `ALTER TABLE DJList ADD COLUMN playTime TEXT NOT NULL DEFAULT ''`
  );

  console.log("✅ playTime column added to DJList table successfully.");
}

main().catch(console.error);
