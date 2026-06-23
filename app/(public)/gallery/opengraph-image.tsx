export const dynamic = "force-dynamic";
export { OG_SIZE as size } from "@/lib/og-image";
export const runtime = "nodejs";
export const alt = "Gallery — Forever Campbells";
export const contentType = "image/png";

import { generateOGImage } from "@/lib/og-image";
export default function OGImage() { return generateOGImage("Gallery"); }
