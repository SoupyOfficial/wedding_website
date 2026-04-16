import { createClient, type Client } from "@libsql/client";

const globalForDb = globalThis as unknown as { dbClient: Client | undefined };

export function getClient(): Client {
  if (globalForDb.dbClient) return globalForDb.dbClient;

  const url =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.dbClient = client;
  }

  return client;
}
