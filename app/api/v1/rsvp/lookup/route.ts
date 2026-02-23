import { NextRequest } from "next/server";
import { query, queryOne, toBool, toBoolAll } from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import type { Guest, MealOption } from "@/lib/db-types";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 10 });

export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  const name = req.nextUrl.searchParams.get("name");

  if (!name || name.trim().length < 2) {
    return errorResponse("Please provide a valid name.", 400);
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  try {
    let guest: Guest | null;
    if (lastName) {
      guest = await queryOne<Guest>(
        "SELECT * FROM Guest WHERE firstName LIKE '%' || ? || '%' AND lastName LIKE '%' || ? || '%' LIMIT 1",
        [firstName, lastName]
      );
    } else {
      guest = await queryOne<Guest>(
        "SELECT * FROM Guest WHERE firstName LIKE '%' || ? || '%' OR lastName LIKE '%' || ? || '%' LIMIT 1",
        [firstName, firstName]
      );
    }

    if (!guest) {
      return errorResponse("Guest not found. Please check the name on your invitation.", 404);
    }
    toBool(guest, "plusOneAllowed", "plusOneAttending");

    const mealOptions = await query<MealOption>(
      "SELECT * FROM MealOption ORDER BY sortOrder ASC"
    );
    toBoolAll(mealOptions, "isVegetarian", "isVegan", "isGlutenFree", "isAvailable");

    const safeGuest = {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvpStatus: guest.rsvpStatus,
      plusOneAllowed: guest.plusOneAllowed,
      plusOneName: guest.plusOneName,
      mealPreference: guest.mealPreference,
      dietaryNeeds: guest.dietaryNeeds,
      songRequest: guest.songRequest,
    };

    return successResponse({ guest: safeGuest, mealOptions });
  } catch (error) {
    console.error("Failed to lookup RSVP:", error);
    return errorResponse("Internal server error.", 500);
  }
}
