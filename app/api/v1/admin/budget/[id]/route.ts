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
    `UPDATE BudgetItem SET
      category = COALESCE(?, category),
      name = COALESCE(?, name),
      vendorName = COALESCE(?, vendorName),
      estimatedCost = COALESCE(?, estimatedCost),
      actualCost = ?,
      depositAmount = ?,
      depositPaid = COALESCE(?, depositPaid),
      dueDate = ?,
      notes = COALESCE(?, notes),
      paid = COALESCE(?, paid),
      vendorId = ?,
      updatedAt = ?
    WHERE id = ?`,
    [
      body.category ?? null,
      body.name ?? null,
      body.vendorName ?? null,
      body.estimatedCost != null ? parseFloat(body.estimatedCost) : null,
      body.actualCost != null ? parseFloat(body.actualCost) : null,
      body.depositAmount != null ? parseFloat(body.depositAmount) : null,
      body.depositPaid != null ? (body.depositPaid ? 1 : 0) : null,
      body.dueDate || null,
      body.notes ?? null,
      body.paid != null ? (body.paid ? 1 : 0) : null,
      body.vendorId ?? null,
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
  await execute("DELETE FROM BudgetItem WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
