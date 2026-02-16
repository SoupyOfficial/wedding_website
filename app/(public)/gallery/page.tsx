import prisma from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Gallery | Jacob & Ashley",
  description: "Photos from our journey together and wedding celebrations.",
};

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });

  const tags = await prisma.photoTag.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    where: {
      photos: { some: { approved: true } },
    },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">Gallery</h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Moments captured, memories preserved forever
          </p>
        </div>

        {/* Gallery with client-side filtering */}
        <GalleryClient
          photos={photos.map((p) => ({
            id: p.id,
            url: p.url,
            caption: p.caption,
            category: p.category,
            tags: p.tags.map((t) => ({
              id: t.id,
              name: t.name,
              type: t.type,
              color: t.color,
            })),
          }))}
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            color: t.color,
            count: t._count.photos,
          }))}
        />

        {/* Upload CTA */}
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
