// Push the schema SQL to Turso database
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Manual .env loading (Node 18 has no --env-file)
const envFile = readFileSync(resolve(__dirname, "..", ".env"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const match = trimmed.match(/^([^=]+)=["']?(.+?)["']?$/);
  if (match) process.env[match[1]] = match[2];
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = readFileSync(resolve(__dirname, "turso-init.sql"), "utf-8");

// Split on semicolons, strip comments, filter empty
const statements = sql
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim()
  )
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} statements to Turso...`);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    // Print first 60 chars of each statement
    console.log(`  ✓ ${stmt.slice(0, 60).replace(/\n/g, " ")}...`);
  } catch (err) {
    console.error(`  ✗ ${stmt.slice(0, 60).replace(/\n/g, " ")}...`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log("Done!");
client.close();
