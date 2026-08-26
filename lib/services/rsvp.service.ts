import { query, queryOne, execute, generateId, now, toBool } from "@/lib/db";
import type { Guest } from "@/lib/db-types";
import { sendEmail } from "@/lib/services/email.service";
import { isEasternPast } from "@/lib/timezone";

export interface RsvpSubmitInput {
  guestId: string;
  attending: boolean;
  email?: string;
  phone?: string;
  dietaryNotes?: string;
  plusOneName?: string;
  bringingPlusOne?: boolean | null;
  songRequest?: string;
  songArtist?: string;
  danceSong?: string;
  firstDanceSong?: string;
}

export interface RsvpSubmitResult {
  guest: Pick<Guest, "id" | "firstName" | "lastName" | "rsvpStatus">;
  isFirstRsvp?: boolean;
}

/**
 * Look up a guest by first and last name for RSVP.
 * Requires both a non-empty first and last name and an exact, case-insensitive
 * full-name match against the guest list (no partial matching).
 * Returns the guest (with booleans converted), or null when either name is
 * empty, no guest matches, or multiple guests share the exact same name.
 */
export async function lookupGuest(firstName: string, lastName: string) {
  if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) return null;

  const guests = await query<Guest>(
    "SELECT * FROM Guest WHERE LOWER(firstName) = LOWER(?) AND LOWER(lastName) = LOWER(?)",
    [firstName.trim(), lastName.trim()]
  );

  if (guests.length === 0 || guests.length > 1) return null;

  const guest = guests[0];
  toBool(guest, "plusOneAllowed", "plusOneAttending");

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvpStatus: guest.rsvpStatus,
      plusOneAllowed: guest.plusOneAllowed,
      plusOneAttending: guest.plusOneAttending,
      plusOneName: guest.plusOneName,
      dietaryNeeds: guest.dietaryNeeds,
      songRequest: guest.songRequest,
      danceSong: guest.danceSong,
      firstDanceSong: guest.firstDanceSong,
    },
  };
}

/**
 * Submit an RSVP for a guest.
 * Updates the guest record and optionally creates a song request.
 * Returns an error message or the updated guest summary.
 */
export async function submitRsvp(input: RsvpSubmitInput): Promise<{ error: string } | RsvpSubmitResult> {
  const { guestId, attending, email, phone, dietaryNotes, plusOneName, bringingPlusOne, songRequest, songArtist, danceSong, firstDanceSong } = input;

  const settings = await queryOne<{
    rsvpDeadline: string | null;
    rsvpEditDeadline: string | null;
    notifyOnRsvp: number;
    notificationEmail: string;
    coupleName: string;
  }>(
    "SELECT rsvpDeadline, rsvpEditDeadline, notifyOnRsvp, notificationEmail, coupleName FROM SiteSettings WHERE id = ?",
    ["singleton"]
  );
  if (settings?.rsvpDeadline) {
    const raw = String(settings.rsvpDeadline);
    const datePart = raw.slice(0, 10);        // "YYYY-MM-DD"
    const timePart = raw.slice(11, 16) || "23:59"; // "HH:MM"
    if (isEasternPast(datePart, timePart)) {
      return { error: "The RSVP deadline has passed. Please contact us directly." };
    }
  }

  const rsvpStatus = attending ? "attending" : "declined";
  const timestamp = now();

  const existingGuest = await queryOne<Guest>("SELECT rsvpSubmittedAt, rsvpStatus FROM Guest WHERE id = ?", [guestId]);
  const isEdit = !!(existingGuest && (existingGuest.rsvpStatus === "attending" || existingGuest.rsvpStatus === "declined"));

  // Edit gate: if this is a re-submission (guest already responded), check rsvpEditDeadline.
  // First-time submissions (rsvpStatus "pending") are governed by rsvpDeadline above only.
  if (isEdit && settings?.rsvpEditDeadline) {
    const rawEdit = String(settings.rsvpEditDeadline);
    const editDatePart = rawEdit.slice(0, 10);        // "YYYY-MM-DD"
    const editTimePart = rawEdit.slice(11, 16) || "23:59"; // "HH:MM"
    if (isEasternPast(editDatePart, editTimePart)) {
      return { error: "The RSVP edit window has closed. Please contact Jacob & Ashley if you need to make changes." };
    }
  }
  const isFirstRsvp = !!(attending && existingGuest && !existingGuest.rsvpSubmittedAt);

  const sets: string[] = ["rsvpStatus = ?", "rsvpRespondedAt = ?", "updatedAt = ?"];
  const args: (string | number | null)[] = [rsvpStatus, timestamp, timestamp];

  if (isFirstRsvp) {
    sets.push("rsvpSubmittedAt = ?");
    args.push(timestamp);
  }

  if (email) { sets.push("email = ?"); args.push(String(email).trim().slice(0, 200)); }
  if (phone) { sets.push("phone = ?"); args.push(String(phone).trim().slice(0, 30)); }
  if (dietaryNotes) { sets.push("dietaryNeeds = ?"); args.push(String(dietaryNotes).trim().slice(0, 500)); }
  if (plusOneName) { sets.push("plusOneName = ?"); args.push(String(plusOneName).trim().slice(0, 100)); }
  if (bringingPlusOne !== undefined && bringingPlusOne !== null) { sets.push("plusOneAttending = ?"); args.push(bringingPlusOne ? 1 : 0); }
  if (danceSong !== undefined) { sets.push("danceSong = ?"); args.push(String(danceSong).trim().slice(0, 200)); }
  if (firstDanceSong !== undefined) { sets.push("firstDanceSong = ?"); args.push(String(firstDanceSong).trim().slice(0, 200)); }

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forevercampbells.com";

  const [confirmationTemplate, adminTemplate] = await Promise.all([
    queryOne<{ subject: string; body: string }>(
      "SELECT subject, body FROM EmailTemplate WHERE slug = ?",
      ["rsvp-confirmation"]
    ),
    queryOne<{ subject: string; body: string }>(
      "SELECT subject, body FROM EmailTemplate WHERE slug = ?",
      ["rsvp-admin-notification"]
    ),
  ]);

  const logEmailFailure = (recipient: string, subject: string, errorMsg: string) => {
    console.error("Email send failed:", { recipient, subject, error: errorMsg });
    execute(
      "INSERT INTO EmailLog (id, campaignId, guestId, email, status, error, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [generateId(), "", guestId, recipient, "failed", String(errorMsg).slice(0, 500), now()]
    ).catch(() => {});
  };

  if (settings?.notifyOnRsvp && settings.notificationEmail) {
    const adminSubject = adminTemplate
      ? adminTemplate.subject.replace("{{firstName}}", guest.firstName).replace("{{status}}", statusLabel).replace("{{websiteUrl}}", siteUrl).replace("{{coupleName}}", settings.coupleName || "Jacob & Ashley")
      : `${statusLabel}: ${guestName} RSVP`;
    const adminHtml = adminTemplate
      ? adminTemplate.body.replace("{{firstName}}", guest.firstName).replace("{{status}}", statusLabel).replace("{{websiteUrl}}", siteUrl).replace("{{coupleName}}", settings.coupleName || "Jacob & Ashley")
      : `<p><strong>${guestName}</strong> has RSVP'd: <strong>${statusLabel}</strong></p>`;

    sendEmail({
      to: settings.notificationEmail,
      subject: adminSubject,
      html: adminHtml,
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      logEmailFailure(settings.notificationEmail, adminSubject, msg);
    });
  }

  if (guestEmail) {
    const guestSubject = confirmationTemplate
      ? confirmationTemplate.subject.replace("{{firstName}}", guest.firstName).replace("{{status}}", statusLabel).replace("{{websiteUrl}}", siteUrl).replace("{{coupleName}}", settings?.coupleName || "Jacob & Ashley")
      : `RSVP Confirmed \u2014 ${settings?.coupleName || "Forever Campbells"}`;
    const guestHtml = confirmationTemplate
      ? confirmationTemplate.body.replace("{{firstName}}", guest.firstName).replace("{{status}}", statusLabel).replace("{{websiteUrl}}", siteUrl).replace("{{coupleName}}", settings?.coupleName || "Jacob & Ashley")
      : `<p>Dear ${guest.firstName},</p><p>Thank you for your RSVP! We've received your response.</p><p>Status: <strong>${statusLabel}</strong></p><p>Visit <a href="${siteUrl}">${siteUrl}</a> for event details, travel info, registry, and all the latest wedding updates.</p><p>With love,<br/>${settings?.coupleName || "Jacob & Ashley"}</p>`;

    sendEmail({
      to: guestEmail,
      subject: guestSubject,
      html: guestHtml,
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      logEmailFailure(guestEmail, guestSubject, msg);
    });
  }

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      rsvpStatus: guest.rsvpStatus,
    },
    isFirstRsvp,
  };
}
