import { NextRequest } from "next/server";
import { queryOne, execute, now, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Guest } from "@/lib/db-types";
import { GUEST_BOOLS } from "@/lib/db-types";

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

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (firstName !== undefined) { sets.push("firstName = ?"); args.push(firstName.trim()); }
    if (lastName !== undefined) { sets.push("lastName = ?"); args.push(lastName.trim()); }
    if (email !== undefined) { sets.push("email = ?"); args.push(email || null); }
    if (phone !== undefined) { sets.push("phone = ?"); args.push(phone || null); }
    if (group !== undefined) { sets.push('"group" = ?'); args.push(group || null); }
    if (rsvpStatus !== undefined) { sets.push("rsvpStatus = ?"); args.push(rsvpStatus); }
    if (plusOneAllowed !== undefined) { sets.push("plusOneAllowed = ?"); args.push(plusOneAllowed ? 1 : 0); }
    if (plusOneName !== undefined) { sets.push("plusOneName = ?"); args.push(plusOneName || null); }
    if (plusOneAttending !== undefined) { sets.push("plusOneAttending = ?"); args.push(plusOneAttending ? 1 : 0); }
    if (mealPreference !== undefined) { sets.push("mealPreference = ?"); args.push(mealPreference || null); }
    if (dietaryNeeds !== undefined) { sets.push("dietaryNeeds = ?"); args.push(dietaryNeeds || null); }
    if (songRequest !== undefined) { sets.push("songRequest = ?"); args.push(songRequest || null); }
    if (childrenCount !== undefined) { sets.push("childrenCount = ?"); args.push(childrenCount); }
    if (childrenNames !== undefined) { sets.push("childrenNames = ?"); args.push(childrenNames || null); }
    if (tableNumber !== undefined) { sets.push("tableNumber = ?"); args.push(tableNumber || null); }
    if (notes !== undefined) { sets.push("notes = ?"); args.push(notes || null); }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(id);

    const { rowsAffected } = await execute(
      `UPDATE Guest SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    if (rowsAffected === 0) {
      return errorResponse("Guest not found.", 404);
    }

    const guest = await queryOne<Guest>("SELECT * FROM Guest WHERE id = ?", [id]);
    if (guest) toBool(guest, ...GUEST_BOOLS);

    return successResponse(guest);
  } catch (error) {
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
    const { rowsAffected } = await execute("DELETE FROM Guest WHERE id = ?", [id]);

    if (rowsAffected === 0) {
      return errorResponse("Guest not found.", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete guest:", error);
    return errorResponse("Internal server error.", 500);
  }
}
