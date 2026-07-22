import { query, queryOne, execute, generateId, now, toBool, toBoolAll } from "@/lib/db";
import type { Guest, MealOption } from "@/lib/db-types";
import { sendEmail } from "@/lib/services/email.service";

export interface RsvpSubmitInput {
  guestId: string;
  attending: boolean;
  email?: string;
  phone?: string;
  dietaryNotes?: string;
  plusOneName?: string;
  mealOptionId?: string;
  plusOneMealOptionId?: string;
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
      plusOneMealPreference: guest.plusOneMealPreference,
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
  const { guestId, attending, email, phone, dietaryNotes, plusOneName, mealOptionId, plusOneMealOptionId, songRequest, songArtist } = input;

  const settings = await queryOne<{
    rsvpDeadline: string | null;
    notifyOnRsvp: number;
    notificationEmail: string;
    coupleName: string;
  }>(
    "SELECT rsvpDeadline, notifyOnRsvp, notificationEmail, coupleName FROM SiteSettings WHERE id = ?",
    ["singleton"]
  );
  if (settings?.rsvpDeadline) {
    const deadline = new Date(settings.rsvpDeadline);
    if (new Date() > deadline) {
      return { error: "The RSVP deadline has passed. Please contact us directly." };
    }
  }

  const rsvpStatus = attending ? "attending" : "declined";
  const timestamp = now();

  const sets: string[] = ["rsvpStatus = ?", "rsvpRespondedAt = ?", "updatedAt = ?"];
  const args: (string | number | null)[] = [rsvpStatus, timestamp, timestamp];

  if (email) { sets.push("email = ?"); args.push(String(email).trim().slice(0, 200)); }
  if (phone) { sets.push("phone = ?"); args.push(String(phone).trim().slice(0, 30)); }
  if (dietaryNotes) { sets.push("dietaryNeeds = ?"); args.push(String(dietaryNotes).trim().slice(0, 500)); }
  if (plusOneName) { sets.push("plusOneName = ?"); args.push(String(plusOneName).trim().slice(0, 100)); }
  if (mealOptionId) {
    const meal = await queryOne("SELECT id FROM MealOption WHERE id = ?", [mealOptionId]);
    if (!meal) return { error: "Invalid meal option." };
    sets.push("mealPreference = ?"); args.push(mealOptionId);
  }
  if (plusOneMealOptionId) {
    const meal = await queryOne("SELECT id FROM MealOption WHERE id = ?", [plusOneMealOptionId]);
    if (!meal) return { error: "Invalid plus-one meal option." };
    sets.push("plusOneMealPreference = ?"); args.push(plusOneMealOptionId);
  }

  args.push(guestId);
  await execute(`UPDATE Guest SET ${sets.join(", ")} WHERE id = ?`, args);

  const guest = await queryOne<Guest>("SELECT * FROM Guest WHERE id = ?", [guestId]);
  if (!guest) return { error: "Guest not found." };
  toBool(guest, "plusOneAllowed", "plusOneAttending");

  if (songRequest && attending) {
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM SongRequest WHERE guestName = ? LIMIT 1",
      [`${guest.firstName} ${guest.lastName}`]
    );
    if (existing) {
      await execute(
        "UPDATE SongRequest SET songTitle = ?, artist = ? WHERE id = ?",
        [songRequest.trim().slice(0, 200), (songArtist || "").trim().slice(0, 150), existing.id]
      );
    } else {
      await execute(
        "INSERT INTO SongRequest (id, songTitle, artist, guestName, approved, isVisible, createdAt) VALUES (?, ?, ?, ?, 0, 0, ?)",
        [generateId(), songRequest.trim().slice(0, 200), (songArtist || "").trim().slice(0, 150), `${guest.firstName} ${guest.lastName}`, now()]
      );
    }
  }

  const guestEmail = email || guest.email;
  const guestName = `${guest.firstName} ${guest.lastName}`;
  const statusLabel = attending ? "Attending" : "Declined";

  if (settings?.notifyOnRsvp && settings.notificationEmail) {
    sendEmail({
      to: settings.notificationEmail,
      subject: `${statusLabel}: ${guestName} RSVP`,
      html: `<p><strong>${guestName}</strong> has RSVP'd: <strong>${statusLabel}</strong></p>`,
    }).catch(() => {});
  }

  if (guestEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forevercampbells.com";
    sendEmail({
      to: guestEmail,
      subject: `RSVP Confirmed — ${settings?.coupleName || "Forever Campbells"}`,
      html: `<p>Dear ${guest.firstName},</p><p>Thank you for your RSVP! We've received your response.</p><p>Status: <strong>${statusLabel}</strong></p><p>Visit <a href="${siteUrl}">${siteUrl}</a> for event details, travel info, registry, and all the latest wedding updates.</p><p>With love,<br/>${settings?.coupleName || "Jacob & Ashley"}</p>`,
    }).catch(() => {});
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
