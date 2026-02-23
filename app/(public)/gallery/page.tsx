import { query } from "@/lib/db";
import GalleryClient from "./GalleryClient";
import { PageHeader } from "@/components/ui";
import type { Photo, PhotoTag } from "@/lib/db-types";

export const metadata = {
  title: "Gallery",
  description: "Photos from our journey together and wedding celebrations.",
};

export default async function GalleryPage() {
  // Get approved photos
  const photos = await query<Photo>(
    "SELECT * FROM Photo WHERE approved = 1 ORDER BY createdAt DESC"
  );

  // Get tags for each photo via join table
  const photoTagRows = await query<{ photoId: string; tagId: string; name: string; type: string; color: string | null }>(
    `SELECT pt.A as photoId, t.id as tagId, t.name, t.type, t.color
     FROM _PhotoToPhotoTag pt
     JOIN PhotoTag t ON t.id = pt.B
     WHERE pt.A IN (SELECT id FROM Photo WHERE approved = 1)`
  );

  // Build a map of photo ID -> tags
  const tagsMap: Record<string, { id: string; name: string; type: string; color: string | null }[]> = {};
  for (const row of photoTagRows) {
    if (!tagsMap[row.photoId]) tagsMap[row.photoId] = [];
    tagsMap[row.photoId].push({ id: row.tagId, name: row.name, type: row.type, color: row.color });
  }

  // Get tags that have at least one approved photo, with counts
  const tags = await query<PhotoTag & { count: number }>(
    `SELECT t.*, COUNT(pt.A) as count
     FROM PhotoTag t
     JOIN _PhotoToPhotoTag pt ON pt.B = t.id
     JOIN Photo p ON p.id = pt.A
     WHERE p.approved = 1
     GROUP BY t.id
     ORDER BY t.type ASC, t.sortOrder ASC, t.name ASC`
  );

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Gallery"
          subtitle="Moments captured, memories preserved forever"
        />

        <GalleryClient
          photos={photos.map((p) => ({
            id: p.id,
            url: p.url,
            caption: p.caption,
            category: p.category,
            tags: (tagsMap[p.id] || []).map((t) => ({
              id: t.id,
              name: t.name,
              type: t.type,
              color: t.color || "",
            })),
          }))}
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            color: t.color || "",
            count: t.count,
          }))}
        />

        <div className="text-center mt-12">
          <div className="card-celestial inline-block max-w-md">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-gold font-serif text-lg mb-2">
              Share Your Photos
            </h3>
            <p className="text-ivory/60 text-sm mb-4">
              Have photos from the wedding? We&apos;d love to see them!
            </p>
            <a
              href="/photos-of-us"
              className="btn-outline inline-block text-sm px-6 py-2"
            >
              Upload Photos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
