import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import RsvpClient from "./RsvpClient";

export const metadata = {
  title: "RSVP",
  description: "Let us know if you can make it to our wedding.",
};

export default async function RSVPPage() {
  const gate = await checkFeatureFlag("rsvpEnabled");
  if (gate) return gate;

  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  return <RsvpClient rsvpDeadline={settings?.rsvpDeadline || null} />;
}
