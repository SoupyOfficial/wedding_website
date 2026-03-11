import { checkFeatureFlag } from "@/lib/feature-gate";
import GuestBookClient from "./GuestBookClient";

export const metadata = {
  title: "Guest Book",
  description: "Sign our guest book and leave us your well wishes.",
};

export default async function GuestBookPage() {
  const gate = await checkFeatureFlag("guestBookEnabled");
  if (gate) return gate;

  return <GuestBookClient />;
}
