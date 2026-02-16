import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

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

    return successResponse(guest);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Guest not found.", 404);
    }
    console.error("Failed to update guest:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guest.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Guest not found.", 404);
    }
    console.error("Failed to delete guest:", error);
    return errorResponse("Internal server error.", 500);
  }
}
