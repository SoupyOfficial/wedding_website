import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin-auth";
import { findDuplicates } from "@/lib/guest-duplicates";

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req as Parameters<typeof requireAdmin>[0]);
  if (authError) return authError;

  const { firstName, lastName, email, excludeId } = await req.json();
  if (!firstName || !lastName) return NextResponse.json({ duplicates: [] });

  const duplicates = await findDuplicates(firstName, lastName, email, excludeId);
  return NextResponse.json({ duplicates });
}
