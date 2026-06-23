import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/middleware/admin-auth";
import { query, execute, generateId, now } from "@/lib/db";
import { sendEmail, buildRsvpReminderEmail } from "@/lib/services/email.service";

interface GuestRow {
  id: string;
  firstName: string;
  email: string | null;
  inviteToken: string | null;
  rsvpStatus: string | null;
}

interface SettingsRow {
  coupleName: string | null;
  rsvpDeadline: string | null;
}

export async function POST(req: NextRequest) {
  const authError = adminAuth(req as Parameters<typeof adminAuth>[0]);
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  const { guestIds, scheduledAt } = body as {
    guestIds?: string[];
    scheduledAt?: string;
  };

  const [settings] = await query<SettingsRow>(
    "SELECT coupleName, rsvpDeadline FROM SiteSettings LIMIT 1"
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forevercampbells.com";
  const coupleName = settings?.coupleName || "The Campbells";
  const rsvpDeadline = settings?.rsvpDeadline || null;

  let guests: GuestRow[];

  if (guestIds?.length) {
    const placeholders = guestIds.map(() => "?").join(", ");
    guests = await query<GuestRow>(
      `SELECT id, firstName, email, inviteToken, rsvpStatus FROM Guest WHERE id IN (${placeholders})`,
      guestIds
    );
  } else {
    guests = await query<GuestRow>(
      "SELECT id, firstName, email, inviteToken, rsvpStatus FROM Guest WHERE email IS NOT NULL AND (rsvpStatus IS NULL OR rsvpStatus NOT IN ('CONFIRMED','DECLINED','attending','declined'))"
    );
  }

  if (guests.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: [] });
  }

  const reminderSubject = "We'd love to see you — have you RSVP'd?";
  const campaignId = generateId();
  const ts = now();

  // If scheduled, persist and return
  if (scheduledAt) {
    await execute(
      "INSERT INTO EmailCampaign (id, name, subject, body, audienceFilter, recipientCount, status, scheduledAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [campaignId, "RSVP Reminder", reminderSubject, "RSVP_REMINDER", JSON.stringify({ pendingOnly: true }), guests.length, "scheduled", scheduledAt, ts, ts]
    );
    return NextResponse.json({ scheduled: true, campaignId, targetCount: guests.length, scheduledAt });
  }

  await execute(
    "INSERT INTO EmailCampaign (id, name, subject, body, audienceFilter, recipientCount, status, sentAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [campaignId, "RSVP Reminder", reminderSubject, "RSVP_REMINDER", JSON.stringify({ pendingOnly: true }), guests.length, "sending", ts, ts, ts]
  );

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const guest of guests) {
    if (!guest.email) { skipped++; continue; }

    const { subject, html } = buildRsvpReminderEmail({
      guestFirstName: guest.firstName,
      coupleName,
      rsvpDeadline,
      siteUrl,
      inviteToken: guest.inviteToken,
    });

    const result = await sendEmail({ to: guest.email, subject, html });
    const logId = generateId();
    const logTs = now();

    if (result.ok) {
      sent++;
      await execute(
        "INSERT INTO EmailLog (id, campaignId, guestId, email, status, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [logId, campaignId, guest.id, guest.email, "sent", logTs, logTs]
      );
    } else {
      errors.push(`${guest.email}: ${result.error}`);
      await execute(
        "INSERT INTO EmailLog (id, campaignId, guestId, email, status, error, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [logId, campaignId, guest.id, guest.email, "failed", result.error ?? "unknown", logTs]
      );
    }
  }

  await execute(
    "UPDATE EmailCampaign SET status = ?, completedAt = ?, updatedAt = ? WHERE id = ?",
    ["sent", ts, ts, campaignId]
  );

  return NextResponse.json({ sent, skipped, errors, campaignId });
}
