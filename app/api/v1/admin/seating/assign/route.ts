import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/middleware/admin-auth";
import { execute } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const { guestId, tableNumber } = await req.json();
  if (!guestId) return NextResponse.json({ error: "guestId required" }, { status: 400 });

  // tableNumber null = unassign
  await execute(
    "UPDATE Guest SET tableNumber = ? WHERE id = ?",
    [tableNumber ?? null, guestId]
  );

  return NextResponse.json({ ok: true });
}
