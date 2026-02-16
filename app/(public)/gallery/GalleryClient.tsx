"use client";

import { useState } from "react";

interface Tag {
  id: string;
  name: string;
  type: string;
  color: string;
  count: number;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
  tags: { id: string; name: string; type: string; color: string }[];
}

const TYPE_ICONS: Record<string, string> = {
  event: "🎉",
  person: "👤",
  date: "📅",
  location: "📍",
  custom: "🏷️",
};

export default function GalleryClient({
  photos,
  tags,
}: {
  photos: Photo[];
  tags: Tag[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? photos.filter((p) => p.tags.some((t) => t.id === activeTag))
    : photos;

  return (
    <>
      {/* Tag Filter Bar */}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              activeTag === null
                ? "bg-gold/20 text-gold border-gold"
                : "bg-royal/20 text-ivory/50 border-gold/10 hover:border-gold/30"
            }`}
          >
            All ({photos.length})
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                setActiveTag(activeTag === tag.id ? null : tag.id)
              }
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                activeTag === tag.id
                  ? "text-white border-white/40"
                  : "text-ivory/60 border-transparent hover:text-ivory"
              }`}
              style={{
                backgroundColor:
                  activeTag === tag.id ? tag.color + "40" : tag.color + "15",
                borderColor:
                  activeTag === tag.id ? tag.color : "transparent",
              }}
            >
              <span className="text-xs">{TYPE_ICONS[tag.type] || "🏷️"}</span>
              {tag.name}
              <span className="text-xs opacity-60">({tag.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {filtered.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-4 group relative overflow-hidden rounded-lg border border-gold/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || "Wedding photo"}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Caption + tags overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent ${
                  photo.caption || photo.tags.length > 0
                    ? "opacity-0 group-hover:opacity-100"
                    : "opacity-0"
                } transition-opacity duration-300 flex flex-col justify-end p-3`}
              >
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {photo.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white/90"
                        style={{ backgroundColor: tag.color + "70" }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {photo.caption && (
                  <p className="text-ivory text-sm">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          {photos.length > 0 ? (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-ivory/60">
                No photos match this filter.{" "}
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-gold underline hover:text-gold-light"
                >
                  Show all
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-gold font-serif text-2xl mb-3">
                Gallery Coming Soon
              </h2>
              <p className="text-ivory/60 max-w-md mx-auto">
                Photos will be added here as our journey unfolds. Check back
                soon for engagement photos, venue sneak peeks, and more!
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
