import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 10 });

export async function GET(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  const name = req.nextUrl.searchParams.get("name");

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Please provide a valid name." },
      { status: 400 }
    );
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  try {
    const guest = await prisma.guest.findFirst({
      where: lastName
        ? {
            firstName: { contains: firstName },
            lastName: { contains: lastName },
          }
        : {
            OR: [
              { firstName: { contains: firstName } },
              { lastName: { contains: firstName } },
            ],
          },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Guest not found. Please check the name on your invitation." },
        { status: 404 }
      );
    }

    const mealOptions = await prisma.mealOption.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Only return fields needed for the RSVP form — strip PII
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

    return NextResponse.json({
      success: true,
      data: { guest: safeGuest, mealOptions },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
