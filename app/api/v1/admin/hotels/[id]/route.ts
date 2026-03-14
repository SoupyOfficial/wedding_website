import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Hotel } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, address, phone, website, bookingLink, blockCode, blockDeadline, notes, distanceFromVenue, priceRange, amenities, sortOrder } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (address !== undefined) { sets.push("address = ?"); args.push(address); }
    if (phone !== undefined) { sets.push("phone = ?"); args.push(phone); }
    if (website !== undefined) { sets.push("website = ?"); args.push(website); }
    if (bookingLink !== undefined) { sets.push("bookingLink = ?"); args.push(bookingLink); }
    if (blockCode !== undefined) { sets.push("blockCode = ?"); args.push(blockCode); }
    if (blockDeadline !== undefined) { sets.push("blockDeadline = ?"); args.push(blockDeadline ? new Date(blockDeadline).toISOString() : null); }
    if (notes !== undefined) { sets.push("notes = ?"); args.push(notes); }
    if (distanceFromVenue !== undefined) { sets.push("distanceFromVenue = ?"); args.push(distanceFromVenue); }
    if (priceRange !== undefined) { sets.push("priceRange = ?"); args.push(priceRange); }
    if (amenities !== undefined) { sets.push("amenities = ?"); args.push(amenities); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE Hotel SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Hotel not found.", 404);

    const hotel = await queryOne<Hotel>("SELECT * FROM Hotel WHERE id = ?", [id]);
    return successResponse(hotel);
  } catch (error) {
    console.error("Failed to update hotel:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM Hotel WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Hotel not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete hotel:", error);
    return errorResponse("Internal server error.", 500);
  }
}
