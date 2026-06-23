import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { execute, now } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const { id } = params;
  const body = await req.json();
  const ts = now();

  await execute(
    `UPDATE Vendor SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      contactName = COALESCE(?, contactName),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      website = COALESCE(?, website),
      instagram = COALESCE(?, instagram),
      contractStatus = COALESCE(?, contractStatus),
      depositDueDate = ?,
      finalPaymentDueDate = ?,
      totalCost = ?,
      notes = COALESCE(?, notes),
      updatedAt = ?
    WHERE id = ?`,
    [
      body.name ?? null,
      body.category ?? null,
      body.contactName ?? null,
      body.phone ?? null,
      body.email ?? null,
      body.website ?? null,
      body.instagram ?? null,
      body.contractStatus ?? null,
      body.depositDueDate || null,
      body.finalPaymentDueDate || null,
      body.totalCost != null ? parseFloat(body.totalCost) : null,
      body.notes ?? null,
      ts,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const { id } = params;
  await execute("DELETE FROM Vendor WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
