import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ guest: null });

  const guest = await queryOne<{ firstName: string; lastName: string }>(
    "SELECT firstName, lastName FROM Guest WHERE inviteToken = ?",
    [token]
  );

  if (!guest) return NextResponse.json({ guest: null }, { status: 404 });

  return NextResponse.json({ guest: { firstName: guest.firstName, lastName: guest.lastName } });
}
