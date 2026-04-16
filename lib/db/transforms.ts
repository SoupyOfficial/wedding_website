/**
 * Convert integer 0/1 values to proper booleans for specified fields.
 * SQLite stores booleans as integers; this ensures correct JS boolean semantics.
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

export function toBoolAll<T>(rows: T[], ...fields: string[]): T[] {
  for (const row of rows) {
    toBool(row, ...fields);
  }
  return rows;
}
