interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  ok: boolean;
  error?: string;
  id?: string;
}

async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  const from = payload.from || process.env.EMAIL_FROM || "noreply@forevercampbells.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [payload.to], subject: payload.subject, html: payload.html }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: err };
  }

  const data = await res.json();
  return { ok: true, id: data.id };
}

async function sendNoop(payload: EmailPayload): Promise<EmailResult> {
  console.log("[Email NOOP]", { to: payload.to, subject: payload.subject });
  return { ok: true, id: "noop-" + Date.now() };
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || "noop";
  if (provider === "resend") return sendViaResend(payload);
  return sendNoop(payload);
}

export function buildRsvpReminderEmail(opts: {
  guestFirstName: string;
  coupleName: string;
  rsvpDeadline: string | null;
  siteUrl: string;
  inviteToken?: string | null;
}): { subject: string; html: string } {
  const { guestFirstName, coupleName, rsvpDeadline, siteUrl, inviteToken } = opts;
  const rsvpUrl = inviteToken ? `${siteUrl}/?invite=${inviteToken}` : siteUrl;
  const deadlineText = rsvpDeadline
    ? `Please RSVP by <strong>${new Date(rsvpDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.`
    : "Please RSVP at your earliest convenience.";

  const subject = `${guestFirstName}, we'd love to know if you're coming!`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="background:#0a0a1a;color:#e8e0d0;font-family:Georgia,serif;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#0d0d2b;border:1px solid rgba(201,168,76,0.2);border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0a0a1a,#0d0d2b);padding:40px 40px 20px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.1);">
      <h1 style="color:#C9A84C;font-size:28px;font-weight:700;margin:0 0 8px;">${coupleName}</h1>
      <p style="color:#e8e0d0;opacity:0.5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0;">Wedding Invitation</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="font-size:17px;line-height:1.6;margin:0 0 16px;">Dear ${guestFirstName},</p>
      <p style="font-size:15px;line-height:1.7;color:#e8e0d0;opacity:0.8;margin:0 0 16px;">
        We noticed we haven't received your RSVP yet and we would love to know if you'll be joining us for our celebration!
      </p>
      <p style="font-size:15px;line-height:1.7;color:#e8e0d0;opacity:0.8;margin:0 0 24px;">
        ${deadlineText}
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${rsvpUrl}" style="display:inline-block;background:#C9A84C;color:#0a0a1a;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;">
          RSVP Now
        </a>
      </div>
      <p style="font-size:13px;color:#e8e0d0;opacity:0.4;margin:0;text-align:center;">
        Can't click the button? Visit: <a href="${rsvpUrl}" style="color:#C9A84C;">${rsvpUrl}</a>
      </p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid rgba(201,168,76,0.1);text-align:center;">
      <p style="color:#e8e0d0;opacity:0.3;font-size:12px;margin:0;">
        With love, ${coupleName}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
