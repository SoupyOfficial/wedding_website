import { NextRequest } from "next/server";
import { queryOne, execute, generateId, now, toBool } from "@/lib/db";
import { eventBus } from "@/lib/events/event-bus";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import type { Guest } from "@/lib/db-types";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const {
      guestId,
      attending,
      email,
      phone,
      dietaryNotes,
      plusOneName,
      mealOptionId,
      songRequest,
      songArtist,
    } = body;

    if (!guestId || typeof attending !== "boolean") {
      return errorResponse("Missing required fields.", 400);
    }

    const rsvpStatus = attending ? "attending" : "declined";
    const timestamp = now();

    // Build dynamic UPDATE
    const sets: string[] = ["rsvpStatus = ?", "rsvpRespondedAt = ?", "updatedAt = ?"];
    const args: (string | number | null)[] = [rsvpStatus, timestamp, timestamp];

    if (email) { sets.push("email = ?"); args.push(String(email).slice(0, 200)); }
    if (phone) { sets.push("phone = ?"); args.push(String(phone).slice(0, 30)); }
    if (dietaryNotes) { sets.push("dietaryNeeds = ?"); args.push(String(dietaryNotes).slice(0, 500)); }
    if (plusOneName) { sets.push("plusOneName = ?"); args.push(String(plusOneName).slice(0, 100)); }
    if (mealOptionId) { sets.push("mealPreference = ?"); args.push(mealOptionId); }

    args.push(guestId);
    await execute(
      `UPDATE Guest SET ${sets.join(", ")} WHERE id = ?`,
      args
    );

    const guest = await queryOne<Guest>("SELECT * FROM Guest WHERE id = ?", [guestId]);
    if (!guest) {
      return errorResponse("Guest not found.", 404);
    }
    toBool(guest, "plusOneAllowed", "plusOneAttending");

    // Create song request if provided
    if (songRequest && attending) {
      await execute(
        "INSERT INTO SongRequest (id, songTitle, artist, guestName, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, 0, 0, ?)",
        [generateId(), songRequest, songArtist || "", `${guest.firstName} ${guest.lastName}`, now()]
      );
    }

    // Emit event
    eventBus.emit("rsvp:submitted", {
      guestId: guest.id,
      status: rsvpStatus,
      guestName: `${guest.firstName} ${guest.lastName}`,
    });

    return successResponse({
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        rsvpStatus: guest.rsvpStatus,
      },
    });
  } catch (error) {
    console.error("Failed to submit RSVP:", error);
    return errorResponse("Internal server error.", 500);
  }
}
