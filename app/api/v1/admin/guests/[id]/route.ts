import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      firstName, lastName, email, phone, group, rsvpStatus,
      plusOneAllowed, plusOneName, plusOneAttending, mealPreference,
      dietaryNeeds, songRequest, childrenCount, childrenNames,
      tableNumber, notes,
    } = body;

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName.trim() }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(group !== undefined && { group: group || null }),
        ...(rsvpStatus !== undefined && { rsvpStatus }),
        ...(plusOneAllowed !== undefined && { plusOneAllowed }),
        ...(plusOneName !== undefined && { plusOneName: plusOneName || null }),
        ...(plusOneAttending !== undefined && { plusOneAttending }),
        ...(mealPreference !== undefined && { mealPreference: mealPreference || null }),
        ...(dietaryNeeds !== undefined && { dietaryNeeds: dietaryNeeds || null }),
        ...(songRequest !== undefined && { songRequest: songRequest || null }),
        ...(childrenCount !== undefined && { childrenCount }),
        ...(childrenNames !== undefined && { childrenNames: childrenNames || null }),
        ...(tableNumber !== undefined && { tableNumber: tableNumber || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ success: true, data: guest });
  } catch {
    return NextResponse.json({ error: "Guest not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
