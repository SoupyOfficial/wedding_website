import { checkFeatureFlag } from "@/lib/feature-gate";
import RsvpClient from "./RsvpClient";

export const metadata = {
  title: "RSVP",
  description: "Let us know if you can make it to our wedding.",
};

export default async function RSVPPage() {
  const gate = await checkFeatureFlag("rsvpEnabled");
  if (gate) return gate;

  return <RsvpClient />;
}
