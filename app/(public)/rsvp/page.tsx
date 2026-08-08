import { getSettings } from "@/lib/services/settings.service";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import { toEasternISO } from "@/lib/timezone";
import PageDisabled from "@/components/PageDisabled";
import RsvpClient from "./RsvpClient";

export const metadata = {
  title: "RSVP",
  description: "Let us know if you can make it to our wedding.",
};

export default async function RSVPPage() {
  const rsvpEnabled = await getFeatureFlag("rsvpEnabled");
  if (!rsvpEnabled)
    return (
      <PageDisabled
        emoji="😄"
        title="Not Just Yet!"
        message="Get out of here, you overachiever! It's a bit too early for RSVPs — we haven't even sent the invites yet. Check back soon!"
      />
    );

  const settings = await getSettings("rsvpDeadline", "rafflePrize");

  const rawDeadline = settings?.rsvpDeadline ? String(settings.rsvpDeadline) : null;
  const easternDeadline = rawDeadline
    ? toEasternISO(rawDeadline.slice(0, 10), rawDeadline.slice(11, 16) || "23:59")
    : null;

  return <RsvpClient rsvpDeadline={easternDeadline} rafflePrize={settings?.rafflePrize || "-1"} />;
}
