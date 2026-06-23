import { query } from "@/lib/db";

export interface DuplicateMatch {
  existingId: string;
  existingName: string;
  existingEmail: string | null;
  matchReason: "exact_email" | "exact_name";
}

export async function findDuplicates(
  firstName: string,
  lastName: string,
  email: string | null | undefined,
  excludeId?: string
): Promise<DuplicateMatch[]> {
  const conditions: string[] = [];
  const params: string[] = [];

  const nameNorm = `${firstName.trim()} ${lastName.trim()}`.toLowerCase();

  // Exact email match
  if (email) {
    conditions.push("(LOWER(email) = ?)");
    params.push(email.toLowerCase().trim());
  }

  // Exact name match (case-insensitive)
  conditions.push("(LOWER(firstName || ' ' || lastName) = ?)");
  params.push(nameNorm);

  if (conditions.length === 0) return [];

  let sql = `SELECT id, firstName, lastName, email FROM Guest WHERE (${conditions.join(" OR ")})`;
  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const rows = await query<{ id: string; firstName: string; lastName: string; email: string | null }>(sql, params);

  return rows.map((row) => {
    const rowEmail = row.email?.toLowerCase().trim();
    const isEmailMatch = !!(email && rowEmail && rowEmail === email.toLowerCase().trim());
    return {
      existingId: row.id,
      existingName: `${row.firstName} ${row.lastName}`,
      existingEmail: row.email,
      matchReason: isEmailMatch ? "exact_email" : "exact_name",
    };
  });
}
