import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { query, queryOne } from "@/lib/db";

interface ActivityRow {
  id: string;
  action: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  metadata: string;
  adminEmail: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = 50;
  const offset = (page - 1) * limit;
  const action = url.searchParams.get("action");
  const entityType = url.searchParams.get("entityType");

  let sql = "SELECT * FROM AdminActivityLog";
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (action) { conditions.push("action = ?"); params.push(action); }
  if (entityType) { conditions.push("entityType = ?"); params.push(entityType); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");

  sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [logs, totalR] = await Promise.all([
    query<ActivityRow>(sql, params),
    queryOne<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM AdminActivityLog${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}`,
      params.slice(0, -2)
    ),
  ]);

  return NextResponse.json({ logs, total: totalR?.cnt ?? 0, page, limit });
}
