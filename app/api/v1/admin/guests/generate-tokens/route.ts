import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { query, execute } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  const guestId: string | null = body.guestId ?? null;

  if (guestId) {
    const token = nanoid(12);
    await execute("UPDATE Guest SET inviteToken = ? WHERE id = ?", [token, guestId]);
    return NextResponse.json({ token });
  }

  const guests = await query<{ id: string }>("SELECT id FROM Guest WHERE inviteToken IS NULL");
  for (const g of guests) {
    await execute("UPDATE Guest SET inviteToken = ? WHERE id = ?", [nanoid(12), g.id]);
  }

  return NextResponse.json({ generated: guests.length });
}
