import { getSettings } from "@/lib/services/settings.service";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { toEasternISO } from "@/lib/timezone";
import PageDisabled from "@/components/PageDisabled";
import RsvpClient from "./RsvpClient";

export const metadata = {
  title: "RSVP",
  description: "Let us know if you can make it to our wedding.",
};

export default async function RSVPPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const rsvpEnabled = await getFeatureFlag("rsvpEnabled");
  if (!rsvpEnabled)
    return (
      <PageDisabled
        emoji="😄"
        title="Not Just Yet!"
        message="Get out of here, you overachiever! It's a bit too early for RSVPs — we haven't even sent the invites yet. Check back soon!"
      />
    );

  const settings = await getSettings(
    "rsvpDeadline", "rsvpEditDeadline", "rafflePrize", "dressCode", "dressCodePinterestLink"
  );

  const rawDeadline = settings?.rsvpDeadline ? String(settings.rsvpDeadline) : null;
  const easternDeadline = rawDeadline
    ? toEasternISO(rawDeadline.slice(0, 10), rawDeadline.slice(11, 16) || "23:59")
    : null;

  const rawEditDeadline = settings?.rsvpEditDeadline ? String(settings.rsvpEditDeadline) : null;
  const easternEditDeadline = rawEditDeadline
    ? toEasternISO(rawEditDeadline.slice(0, 10), rawEditDeadline.slice(11, 16) || "23:59")
    : null;

  const params = await searchParams;
  let prefillName: string | undefined;

  if (params?.invite) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/v1/invite/${encodeURIComponent(params.invite)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.guest) {
          prefillName = `${data.guest.firstName} ${data.guest.lastName}`;
        }
      }
    } catch {
      // Silently fall back — guest can look up manually
    }
  }

  return (
    <RsvpClient
      rsvpDeadline={easternDeadline}
      rsvpEditDeadlineIso={easternEditDeadline}
      rafflePrize={settings?.rafflePrize || "-1"}
      dressCode={settings?.dressCode ? String(settings.dressCode) : null}
      dressCodePinterestLink={settings?.dressCodePinterestLink ? String(settings.dressCodePinterestLink) : null}
      prefillName={prefillName}
    />
  );
}
