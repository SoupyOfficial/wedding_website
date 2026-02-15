"use client";

import { useState, useEffect, useCallback } from "react";

interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  approved: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/photos");
      const data = await res.json();
      if (data.data) setPhotos(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/v1/admin/photos/${id}/approve`, { method: "POST" });
      fetchPhotos();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await fetch(`/api/v1/admin/photos/${id}`, { method: "DELETE" });
      fetchPhotos();
    } catch {
      // silently fail
    }
  }

  const filtered = photos.filter((p) => {
    if (filter === "pending") return !p.approved;
    if (filter === "approved") return p.approved;
    return true;
  });

  const pendingCount = photos.filter((p) => !p.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Photo Manager</h1>
          <p className="text-ivory/50 text-sm">
            {photos.length} photos • {pendingCount} pending approval
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              filter === f
                ? "bg-gold/20 text-gold border border-gold"
                : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1 bg-gold text-midnight px-1.5 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading photos...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className={`relative group rounded-lg overflow-hidden border ${
                photo.approved ? "border-gold/10" : "border-yellow-500/30"
              }`}
            >
              <img
                src={photo.url}
                alt={photo.caption || "Photo"}
                className="w-full h-48 object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-midnight/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {photo.caption && (
                  <p className="text-ivory text-xs text-center mb-1">
                    {photo.caption}
                  </p>
                )}
                {photo.uploadedBy && (
                  <p className="text-ivory/50 text-xs">
                    by {photo.uploadedBy}
                  </p>
                )}
                <div className="flex gap-2">
                  {!photo.approved && (
                    <button
                      onClick={() => handleApprove(photo.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              {!photo.approved && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-midnight px-2 py-0.5 rounded text-xs font-bold">
                  Pending
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-ivory/40">
          No photos found.
        </div>
      )}
    </div>
  );
}
