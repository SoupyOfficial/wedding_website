import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/middleware/admin-auth";
import { query, execute, generateId, now } from "@/lib/db";

interface TableRow {
  id: string;
  name: string;
  capacity: number;
  shape: string;
  sortOrder: number;
  notes: string;
  createdAt: string;
}

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  tableNumber: number | null;
  rsvpStatus: string;
}

export async function GET(req: NextRequest) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const [tables, guests] = await Promise.all([
    query<TableRow>("SELECT * FROM SeatingTable ORDER BY sortOrder ASC, name ASC"),
    query<GuestRow>("SELECT id, firstName, lastName, tableNumber, rsvpStatus FROM Guest ORDER BY lastName ASC, firstName ASC"),
  ]);

  return NextResponse.json({ tables, guests });
}

export async function POST(req: NextRequest) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const body = await req.json();
  const { name, capacity = 8, shape = "round", notes = "", sortOrder = 0 } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const id = generateId();
  const ts = now();
  await execute(
    "INSERT INTO SeatingTable (id, name, capacity, shape, notes, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, name.trim(), capacity, shape, notes, sortOrder, ts, ts]
  );

  return NextResponse.json({ id, name: name.trim(), capacity, shape, notes, sortOrder }, { status: 201 });
}
