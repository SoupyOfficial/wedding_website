import { query, queryOne, execute, generateId, now, toBool, toBoolAll } from "@/lib/db";
import type { Guest, MealOption } from "@/lib/db-types";

export interface RsvpSubmitInput {
  guestId: string;
  attending: boolean;
  email?: string;
  phone?: string;
  dietaryNotes?: string;
  plusOneName?: string;
  mealOptionId?: string;
  songRequest?: string;
  songArtist?: string;
}

export interface RsvpSubmitResult {
  guest: Pick<Guest, "id" | "firstName" | "lastName" | "rsvpStatus">;
}

/**
 * Look up a guest by name for RSVP.
 * Returns the guest (with booleans converted) and available meal options,
 * or null if not found.
 */
export async function lookupGuest(name: string) {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

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

  if (!guest) return null;
  toBool(guest, "plusOneAllowed", "plusOneAttending");

  const mealOptions = await query<MealOption>(
    "SELECT * FROM MealOption ORDER BY sortOrder ASC"
  );
  toBoolAll(mealOptions, "isVegetarian", "isVegan", "isGlutenFree", "isAvailable");

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvpStatus: guest.rsvpStatus,
      plusOneAllowed: guest.plusOneAllowed,
      plusOneName: guest.plusOneName,
      mealPreference: guest.mealPreference,
      dietaryNeeds: guest.dietaryNeeds,
      songRequest: guest.songRequest,
    },
    mealOptions,
  };
}

/**
 * Submit an RSVP for a guest.
 * Validates meal option, updates guest record, and optionally creates a song request.
 * Returns null if the meal option is invalid, or the updated guest summary.
 */
export async function submitRsvp(input: RsvpSubmitInput): Promise<{ error: string } | RsvpSubmitResult> {
  const { guestId, attending, email, phone, dietaryNotes, plusOneName, mealOptionId, songRequest, songArtist } = input;
  const rsvpStatus = attending ? "attending" : "declined";
  const timestamp = now();

  const sets: string[] = ["rsvpStatus = ?", "rsvpRespondedAt = ?", "updatedAt = ?"];
  const args: (string | number | null)[] = [rsvpStatus, timestamp, timestamp];

  if (email) { sets.push("email = ?"); args.push(String(email).slice(0, 200)); }
  if (phone) { sets.push("phone = ?"); args.push(String(phone).slice(0, 30)); }
  if (dietaryNotes) { sets.push("dietaryNeeds = ?"); args.push(String(dietaryNotes).slice(0, 500)); }
  if (plusOneName) { sets.push("plusOneName = ?"); args.push(String(plusOneName).slice(0, 100)); }
  if (mealOptionId) {
    const meal = await queryOne("SELECT id FROM MealOption WHERE id = ?", [mealOptionId]);
    if (!meal) return { error: "Invalid meal option." };
    sets.push("mealPreference = ?"); args.push(mealOptionId);
  }

  args.push(guestId);
  await execute(`UPDATE Guest SET ${sets.join(", ")} WHERE id = ?`, args);

  const guest = await queryOne<Guest>("SELECT * FROM Guest WHERE id = ?", [guestId]);
  if (!guest) return { error: "Guest not found." };
  toBool(guest, "plusOneAllowed", "plusOneAttending");

  if (songRequest && attending) {
    await execute(
      "INSERT INTO SongRequest (id, songTitle, artist, guestName, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, 0, 0, ?)",
      [generateId(), songRequest, songArtist || "", `${guest.firstName} ${guest.lastName}`, now()]
    );
  }

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvpStatus: guest.rsvpStatus,
    },
  };
}
