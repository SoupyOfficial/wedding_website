import prisma from "@/lib/db";

export const metadata = {
  title: "Gallery | Jacob & Ashley",
  description: "Photos from our journey together and wedding celebrations.",
};

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set(photos.map((p: { category: string | null }) => p.category).filter(Boolean))];

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

        {/* Category Filter (client-side with CSS only) */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="text-ivory/50 text-sm px-3 py-1 rounded bg-royal/50 border border-gold/20">
              All Photos ({photos.length})
            </span>
            {categories.map((cat) => (
              <span
                key={cat as string}
                className="text-ivory/50 text-sm px-3 py-1 rounded bg-royal/30 border border-gold/10"
              >
                {cat as string}
              </span>
            ))}
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
            {photos.map((photo: { id: string; url: string; caption: string | null; category: string | null }) => (
              <div
                key={photo.id}
                className="break-inside-avoid mb-4 group relative overflow-hidden rounded-lg border border-gold/10"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-ivory text-sm">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-gold font-serif text-2xl mb-3">
              Gallery Coming Soon
            </h2>
            <p className="text-ivory/60 max-w-md mx-auto">
              Photos will be added here as our journey unfolds. Check back soon
              for engagement photos, venue sneak peeks, and more!
            </p>
          </div>
        )}

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
            <a href="/photos-of-us" className="btn-outline inline-block text-sm px-6 py-2">
              Upload Photos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
