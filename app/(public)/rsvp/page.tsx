import { getSettings } from "@/lib/services/settings.service";
import { getFeatureFlag } from "@/lib/config/feature-flags";
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

  const settings = await getSettings("rsvpDeadline");

  return <RsvpClient rsvpDeadline={settings?.rsvpDeadline || null} />;
}
