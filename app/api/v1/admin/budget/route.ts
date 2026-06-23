import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { query, execute, generateId, now } from "@/lib/db";

interface BudgetRow {
  id: string;
  category: string;
  name: string;
  vendorName: string;
  estimatedCost: number;
  actualCost: number | null;
  depositAmount: number | null;
  depositPaid: number;
  dueDate: string | null;
  notes: string;
  paid: number;
  sortOrder: number;
  vendorId: string | null;
  vendorName2: string | null;
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const [items, settings] = await Promise.all([
    query<BudgetRow>(
      `SELECT b.*, v.name as vendorName2 FROM BudgetItem b LEFT JOIN Vendor v ON v.id = b.vendorId ORDER BY b.category ASC, b.sortOrder ASC`
    ),
    query<{ totalBudget: number | null }>("SELECT totalBudget FROM SiteSettings LIMIT 1"),
  ]);

  const mapped = items.map((item) => ({
    ...item,
    depositPaid: !!item.depositPaid,
    paid: !!item.paid,
    vendor: item.vendorId ? { id: item.vendorId, name: item.vendorName2 } : null,
  }));

  return NextResponse.json({ items: mapped, totalBudget: settings[0]?.totalBudget ?? null });
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const body = await req.json();
  const id = generateId();
  const ts = now();

  await execute(
    "INSERT INTO BudgetItem (id, category, name, vendorName, estimatedCost, actualCost, depositAmount, depositPaid, dueDate, notes, paid, sortOrder, vendorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      body.category || "Other",
      body.name || "",
      body.vendorName || "",
      parseFloat(body.estimatedCost) || 0,
      body.actualCost != null ? parseFloat(body.actualCost) : null,
      body.depositAmount != null ? parseFloat(body.depositAmount) : null,
      body.depositPaid ? 1 : 0,
      body.dueDate || null,
      body.notes || "",
      body.paid ? 1 : 0,
      body.sortOrder ?? 0,
      body.vendorId || null,
      ts, ts,
    ]
  );

  return NextResponse.json({ id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const body = await req.json();
  if (body.totalBudget !== undefined) {
    const existing = await query("SELECT id FROM SiteSettings LIMIT 1");
    const ts = now();
    if (existing.length > 0) {
      await execute("UPDATE SiteSettings SET totalBudget = ?, updatedAt = ?", [
        body.totalBudget != null ? parseFloat(body.totalBudget) : null,
        ts,
      ]);
    } else {
      await execute("INSERT INTO SiteSettings (id, totalBudget, updatedAt) VALUES ('singleton', ?, ?)", [
        body.totalBudget != null ? parseFloat(body.totalBudget) : null,
        ts,
      ]);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}
