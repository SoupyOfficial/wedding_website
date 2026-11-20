"use client";

import { useState } from "react";
import { isVideoUrl } from "@/lib/media";
import { Alert } from "@/components/ui";

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

function filenameFromUrl(url: string): string {
  const clean = url.split("?")[0];
  const name = clean.split("/").pop() || "photo";
  return name || "photo";
}

function extensionFromUrl(url: string): string {
  const name = filenameFromUrl(url);
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "jpg";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function GalleryClient({
  photos,
  tags,
}: {
  photos: Photo[];
  tags: Tag[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [zipStatus, setZipStatus] = useState("");
  const [zipError, setZipError] = useState("");
  const [zipNotice, setZipNotice] = useState("");
  const [singleError, setSingleError] = useState("");

  const filtered = activeTag
    ? photos.filter((p) => p.tags.some((t) => t.id === activeTag))
    : photos;

  const filteredImages = filtered.filter((p) => !isVideoUrl(p.url));

  function handleTileClick(photoId: string, index: number, shiftKey: boolean) {
    if (shiftKey && lastIndex !== null) {
      const from = Math.min(lastIndex, index);
      const to = Math.max(lastIndex, index);
      const ids = filtered.slice(from, to + 1).map((p) => p.id);
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(photoId)) next.delete(photoId);
        else next.add(photoId);
        return next;
      });
    }
    setLastIndex(index);
  }

  function selectAllVisible() {
    setSelected(new Set(filtered.map((p) => p.id)));
  }

  function clearSelection() {
    setSelected(new Set());
    setLastIndex(null);
  }

  async function downloadSingle(photo: Photo) {
    setSingleError("");
    try {
      const res = await fetch(photo.url);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      triggerDownload(blob, filenameFromUrl(photo.url));
    } catch {
      setSingleError("That download failed. Please try again.");
    }
  }

  async function downloadZip(items: Photo[], filename: string) {
    if (items.length === 0) return;
    setZipError("");
    setZipNotice("");
    setZipStatus(`Preparing ${items.length} photo${items.length === 1 ? "" : "s"}…`);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        setZipStatus(`Fetching photo ${i + 1} of ${items.length}…`);
        try {
          const res = await fetch(items[i].url);
          if (!res.ok) continue;
          const blob = await res.blob();
          zip.file(`${String(i + 1).padStart(3, "0")}.${extensionFromUrl(items[i].url)}`, blob);
        } catch {
          // skip photos that fail to fetch
        }
      }

      setZipStatus("Creating ZIP file…");
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      triggerDownload(blob, filename);
    } catch {
      setZipError("Couldn't prepare the ZIP. Please try again.");
    } finally {
      setZipStatus("");
    }
  }

  function downloadSelected() {
    setZipError("");
    setZipNotice("");
    const selectedImages = filtered.filter((p) => selected.has(p.id) && !isVideoUrl(p.url));
    const selectedVideos = filtered.filter((p) => selected.has(p.id) && isVideoUrl(p.url));

    if (selectedImages.length === 0 && selectedVideos.length === 0) {
      setZipError("Select at least one photo first.");
      return;
    }

    if (selectedImages.length > 0) {
      void downloadZip(selectedImages, "forever-campbells-selected-photos.zip");
    }
    if (selectedVideos.length > 0) {
      setZipNotice(
        `${selectedVideos.length} video${selectedVideos.length === 1 ? "" : "s"} can be saved individually with the ⬇ button.`
      );
    }
  }

  return (
    <>
      {/* Download controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => {
            if (selectMode) clearSelection();
            setSelectMode(!selectMode);
          }}
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            selectMode
              ? "bg-gold text-midnight border-gold"
              : "bg-gold/20 text-gold border-gold hover:bg-gold/30"
          }`}
        >
          {selectMode ? "Done Selecting" : "Select Photos"}
        </button>
        <button
          onClick={() =>
            void downloadZip(filteredImages, "forever-campbells-wedding-photos.zip")
          }
          disabled={filteredImages.length === 0}
          className="text-sm px-4 py-1.5 rounded-full border bg-gold/20 text-gold border-gold hover:bg-gold/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Download All{filteredImages.length > 0 ? ` (${filteredImages.length})` : ""}
        </button>
      </div>

      {zipStatus && <Alert type="info" message={zipStatus} className="mb-4 max-w-md mx-auto" />}
      {zipError && <Alert type="error" message={zipError} className="mb-4 max-w-md mx-auto" />}
      {zipNotice && <Alert type="info" message={zipNotice} className="mb-4 max-w-md mx-auto" />}
      {singleError && <Alert type="error" message={singleError} className="mb-4 max-w-md mx-auto" />}

      {selectMode && (
        <p className="text-center text-ivory/50 text-xs mb-4">
          Tap photos to select · hold Shift and tap for a range
        </p>
      )}

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
          {filtered.map((photo, index) => (
            <div
              key={photo.id}
              onClick={(e) => {
                if (selectMode) handleTileClick(photo.id, index, e.shiftKey);
              }}
              onKeyDown={(e) => {
                if (selectMode && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleTileClick(photo.id, index, e.shiftKey);
                }
              }}
              role={selectMode ? "button" : undefined}
              tabIndex={selectMode ? 0 : undefined}
              className={`break-inside-avoid mb-4 group relative overflow-hidden rounded-lg border transition-colors ${
                selected.has(photo.id)
                  ? "border-gold ring-2 ring-gold"
                  : "border-gold/10"
              } ${selectMode ? "cursor-pointer" : ""}`}
            >
              {isVideoUrl(photo.url) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={photo.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full object-cover"
                  onClick={(e) => {
                    if (selectMode) e.stopPropagation();
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              )}

              {/* Selection indicator */}
              {selectMode && (
                <div
                  className={`absolute top-2 left-2 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors pointer-events-none ${
                    selected.has(photo.id)
                      ? "bg-gold text-midnight border-gold"
                      : "bg-midnight/60 text-transparent border-ivory/60"
                  }`}
                >
                  ✓
                </div>
              )}

              {/* Download button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void downloadSingle(photo);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-midnight/70 text-ivory border border-gold/30 hover:bg-gold hover:text-midnight transition-colors flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                aria-label={`Download ${photo.caption || "photo"}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
                  />
                </svg>
              </button>

              {/* Caption + tags overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent pointer-events-none ${
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

      {/* Selection toolbar */}
      {selectMode && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 flex justify-center">
          <div className="card-celestial flex flex-wrap items-center justify-center gap-3 px-4 py-3">
            <span className="text-ivory text-sm whitespace-nowrap">
              {selected.size} selected
            </span>
            <button
              onClick={downloadSelected}
              disabled={selected.size === 0}
              className="btn-gold text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Download Selected
            </button>
            <button
              onClick={selectAllVisible}
              className="btn-outline text-xs px-3 py-1.5"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="btn-outline text-xs px-3 py-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}
