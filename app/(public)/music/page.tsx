import { checkFeatureFlag } from "@/lib/feature-gate";
import MusicClient from "./MusicClient";

export const metadata = {
  title: "Song Requests",
  description: "Request songs for the wedding reception playlist.",
};

export default async function MusicPage() {
  const gate = await checkFeatureFlag("musicPageEnabled");
  if (gate) return gate;

  return <MusicClient />;
}
