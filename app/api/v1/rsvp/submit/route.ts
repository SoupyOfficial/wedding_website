import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { eventBus } from "@/lib/events/event-bus";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";

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

    // Update guest RSVP with length-limited inputs
    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        rsvpStatus,
        rsvpRespondedAt: new Date(),
        email: email ? String(email).slice(0, 200) : undefined,
        phone: phone ? String(phone).slice(0, 30) : undefined,
        dietaryNeeds: dietaryNotes ? String(dietaryNotes).slice(0, 500) : undefined,
        plusOneName: plusOneName ? String(plusOneName).slice(0, 100) : undefined,
        mealPreference: mealOptionId || undefined,
      },
    });

    // Create song request if provided
    if (songRequest && attending) {
      await prisma.songRequest.create({
        data: {
          songTitle: songRequest,
          artist: songArtist || null,
          guestName: `${guest.firstName} ${guest.lastName}`,
        },
      });
    }

    // Emit event
    eventBus.emit("rsvp:submitted", {
      guestId: guest.id,
      status: rsvpStatus,
      guestName: `${guest.firstName} ${guest.lastName}`,
    });

    // Only return confirmation data — strip PII
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
