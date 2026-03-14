import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Hotel } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hotels = await query<Hotel>(
      "SELECT * FROM Hotel ORDER BY sortOrder ASC"
    );
    return successResponse(hotels);
  } catch (error) {
    console.error("Failed to fetch hotels:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, phone, website, bookingLink, blockCode, blockDeadline, notes, distanceFromVenue, priceRange, amenities, sortOrder } = body;

    if (!name?.trim()) return errorResponse("Hotel name is required.", 400);

    const id = generateId();
    await execute(
      `INSERT INTO Hotel (id, name, address, phone, website, bookingLink, blockCode, blockDeadline, notes, distanceFromVenue, priceRange, amenities, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        address || "",
        phone || "",
        website || "",
        bookingLink || "",
        blockCode || "",
        blockDeadline ? new Date(blockDeadline).toISOString() : null,
        notes || "",
        distanceFromVenue || "",
        priceRange || "",
        amenities || "",
        sortOrder ?? 0,
      ]
    );

    const hotel = await queryOne<Hotel>("SELECT * FROM Hotel WHERE id = ?", [id]);
    return successResponse(hotel, undefined, 201);
  } catch (error) {
    console.error("Failed to create hotel:", error);
    return errorResponse("Internal server error.", 500);
  }
}
