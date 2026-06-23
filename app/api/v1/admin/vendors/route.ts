import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { query, execute, generateId, now } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const vendors = await query<{
    id: string; name: string; category: string; contactName: string;
    phone: string; email: string; website: string; instagram: string;
    contractStatus: string; depositDueDate: string | null; finalPaymentDueDate: string | null;
    totalCost: number | null; notes: string;
  }>("SELECT * FROM Vendor ORDER BY category ASC, name ASC");

  const budgetItems = await query<{ id: string; name: string; estimatedCost: number; actualCost: number | null; vendorId: string | null }>(
    "SELECT id, name, estimatedCost, actualCost, vendorId FROM BudgetItem WHERE vendorId IS NOT NULL"
  );

  const itemsByVendor: Record<string, typeof budgetItems> = {};
  for (const item of budgetItems) {
    if (!item.vendorId) continue;
    if (!itemsByVendor[item.vendorId]) itemsByVendor[item.vendorId] = [];
    itemsByVendor[item.vendorId].push(item);
  }

  const result = vendors.map((v) => ({ ...v, budgetItems: itemsByVendor[v.id] ?? [] }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const body = await req.json();
  const id = generateId();
  const ts = now();

  await execute(
    "INSERT INTO Vendor (id, name, category, contactName, phone, email, website, instagram, contractStatus, depositDueDate, finalPaymentDueDate, totalCost, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      body.name || "",
      body.category || "Other",
      body.contactName || "",
      body.phone || "",
      body.email || "",
      body.website || "",
      body.instagram || "",
      body.contractStatus || "none",
      body.depositDueDate || null,
      body.finalPaymentDueDate || null,
      body.totalCost != null ? parseFloat(body.totalCost) : null,
      body.notes || "",
      ts, ts,
    ]
  );

  return NextResponse.json({ id }, { status: 201 });
}
