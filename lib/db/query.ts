import { type InValue } from "@libsql/client";
import { getClient } from "./client";

type SqlArgs = InValue[];

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

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  args: SqlArgs = []
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

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
