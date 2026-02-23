import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now, toBoolAll, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Guest } from "@/lib/db-types";
import { GUEST_BOOLS } from "@/lib/db-types";

export async function GET() {
  try {
    const guests = await query<Guest>(
      "SELECT * FROM Guest ORDER BY createdAt DESC"
    );
    toBoolAll(guests, ...GUEST_BOOLS);
    return successResponse(guests);
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, group, plusOneAllowed } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return errorResponse("Name is required.", 400);
    }

    const id = generateId();
    const timestamp = now();
    await execute(
      `INSERT INTO Guest (id, firstName, lastName, email, "group", rsvpStatus, plusOneAllowed, plusOneAttending, childrenCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, 0, 0, ?, ?)`,
      [id, firstName.trim(), lastName.trim(), email || null, group || null, plusOneAllowed ? 1 : 0, timestamp, timestamp]
    );

    const guest = await queryOne<Guest>("SELECT * FROM Guest WHERE id = ?", [id]);
    if (guest) toBool(guest, ...GUEST_BOOLS);

    return successResponse(guest, undefined, 201);
  } catch (error) {
    console.error("Failed to create guest:", error);
    return errorResponse("Internal server error.", 500);
  }
}
