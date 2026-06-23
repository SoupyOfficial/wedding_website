import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/middleware/admin-auth";
import { execute, now } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const { id } = params;
  const body = await req.json();
  const { name, capacity, shape, notes, sortOrder } = body;

  const ts = now();
  await execute(
    "UPDATE SeatingTable SET name = COALESCE(?, name), capacity = COALESCE(?, capacity), shape = COALESCE(?, shape), notes = COALESCE(?, notes), sortOrder = COALESCE(?, sortOrder), updatedAt = ? WHERE id = ?",
    [name ?? null, capacity ?? null, shape ?? null, notes ?? null, sortOrder ?? null, ts, id]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const { id } = params;
  // Unassign guests at this table number before deleting
  await execute("DELETE FROM SeatingTable WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
