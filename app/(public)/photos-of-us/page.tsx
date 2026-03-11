import { checkFeatureFlag } from "@/lib/feature-gate";
import PhotosOfUsClient from "./PhotosOfUsClient";

export const metadata = {
  title: "Photos of Us",
  description: "Share your photos from the wedding celebration.",
};

export default async function PhotosOfUsPage() {
  const gate = await checkFeatureFlag("photosOfUsPageEnabled");
  if (gate) return gate;

  return <PhotosOfUsClient />;
}
