import { createClient, type Client, type InValue } from "@libsql/client";

// ─── Singleton Client ────────────────────────────────────────────────

const globalForDb = globalThis as unknown as { dbClient: Client | undefined };

function getClient(): Client {
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

// ─── Query Helpers ───────────────────────────────────────────────────

type SqlArgs = InValue[];

/**
 * Execute a SELECT query and return all rows typed as T.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  args: SqlArgs = []
): Promise<T[]> {
  const client = getClient();
  const result = await client.execute({ sql, args });
  return result.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of result.columns) {
      obj[col] = (row as Record<string, unknown>)[col];
    }
    return obj as T;
  });
}

/**
 * Execute a SELECT query and return the first row (or null).
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  args: SqlArgs = []
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

/**
 * Execute an INSERT/UPDATE/DELETE statement.
 */
export async function execute(
  sql: string,
  args: SqlArgs = []
): Promise<{ rowsAffected: number; lastInsertRowid: bigint | undefined }> {
  const client = getClient();
  const result = await client.execute({ sql, args });
  return {
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid,
  };
}

// ─── Utilities ───────────────────────────────────────────────────────

/**
 * Generate a unique ID (UUID v4) for new records.
 * Replaces Prisma's cuid() auto-generation.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get current timestamp as ISO 8601 string.
 * Replaces Prisma's @default(now()) and @updatedAt.
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Convert integer 0/1 values to proper booleans for specified fields.
 * SQLite stores booleans as integers; this ensures correct JS boolean semantics
 * and proper JSON serialization.
 */
export function toBool<T>(row: T, ...fields: string[]): T {
  const r = row as Record<string, unknown>;
  for (const f of fields) {
    if (f in r) {
      r[f] = r[f] === 1 || r[f] === true;
    }
  }
  return row;
}

/**
 * Apply toBool to all rows in an array.
 */
export function toBoolAll<T>(rows: T[], ...fields: string[]): T[] {
  for (const row of rows) {
    toBool(row, ...fields);
  }
  return rows;
}

/**
 * Check if a SQLite error is a unique constraint violation.
 * Replaces Prisma error code P2002.
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed")
  );
}

// ─── Default Export ──────────────────────────────────────────────────

const db = {
  query,
  queryOne,
  execute,
  generateId,
  now,
  getClient,
  toBool,
  toBoolAll,
  isUniqueViolation,
};

export default db;
