import { checkFeatureFlag } from "@/lib/feature-gate";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the happy couple.",
};

export default async function ContactPage() {
  const gate = await checkFeatureFlag("contactPageEnabled");
  if (gate) return gate;

  return <ContactClient />;
}
