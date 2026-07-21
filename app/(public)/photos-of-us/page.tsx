import { checkFeatureFlag } from "@/lib/feature-gate";
import PhotosOfUsClient from "./PhotosOfUsClient";

export const metadata = {
  title: "Our Photos",
  description: "A curated collection of our favorite moments together.",
};

export default async function PhotosOfUsPage() {
  const gate = await checkFeatureFlag("photosOfUsPageEnabled");
  if (gate) return gate;

  return <PhotosOfUsClient />;
}
