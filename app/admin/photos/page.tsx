"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PhotoTag {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  approved: boolean;
  uploadedBy: string | null;
  createdAt: string;
  tags: PhotoTag[];
}

const TAG_TYPES = [
  { value: "event", label: "Event", icon: "🎉" },
  { value: "person", label: "Person", icon: "👤" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "location", label: "Location", icon: "📍" },
  { value: "custom", label: "Custom", icon: "🏷️" },
];

const TAG_COLORS = [
  "#C9A84C", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4",
];

const CATEGORIES = ["ceremony", "reception", "preparation", "portrait", "detail", "other"];

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allTags, setAllTags] = useState<PhotoTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tag creation
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState("custom");
  const [newTagColor, setNewTagColor] = useState("#C9A84C");

  // Tag assignment modal
  const [taggingPhotoId, setTaggingPhotoId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Edit modal
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editForm, setEditForm] = useState({ caption: "", category: "" });

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/photos");
      const data = await res.json();
      if (data.data) setPhotos(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/photos/tags");
      const data = await res.json();
      if (data.data) setAllTags(data.data);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetchTags();
  }, [fetchPhotos, fetchTags]);

  // ── Approval Toggle ───────────────────────────
  async function toggleApproval(photo: Photo) {
    try {
      const res = await fetch(`/api/v1/admin/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !photo.approved }),
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, approved: !photo.approved } : p))
        );
      }
    } catch { /* silently fail */ }
  }

  // ── Edit Photo ────────────────────────────────
  function openEditModal(photo: Photo) {
    setEditingPhoto(photo);
    setEditForm({ caption: photo.caption || "", category: photo.category || "" });
  }

  async function saveEdit() {
    if (!editingPhoto) return;
    try {
      const res = await fetch(`/api/v1/admin/photos/${editingPhoto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === editingPhoto.id ? { ...p, ...editForm } : p))
        );
        setEditingPhoto(null);
      }
    } catch { /* silently fail */ }
  }

  // ── Delete Photo ──────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await fetch(`/api/v1/admin/photos/${id}`, { method: "DELETE" });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silently fail */ }
  }

  // ── Admin Upload ──────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("guestName", "Admin");
        await fetch("/api/v1/photos/upload", { method: "POST", body: formData });
      }
      fetchPhotos();
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Tags ──────────────────────────────────────
  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/v1/admin/photos/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), type: newTagType, color: newTagColor }),
      });
      if (res.ok) {
        setNewTagName("");
        setShowTagForm(false);
        fetchTags();
      }
    } catch { /* silently fail */ }
  }

  async function handleDeleteTag(tagId: string) {
    if (!confirm("Delete this tag? It will be removed from all photos.")) return;
    try {
      await fetch(`/api/v1/admin/photos/tags/${tagId}`, { method: "DELETE" });
      fetchTags();
      fetchPhotos();
    } catch { /* silently fail */ }
  }

  function openTagModal(photo: Photo) {
    setTaggingPhotoId(photo.id);
    setSelectedTagIds(photo.tags.map((t) => t.id));
  }

  function toggleTagSelection(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSaveTags() {
    if (!taggingPhotoId) return;
    try {
      await fetch(`/api/v1/admin/photos/${taggingPhotoId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: selectedTagIds }),
      });
      setTaggingPhotoId(null);
      fetchPhotos();
    } catch { /* silently fail */ }
  }

  // ── Filtering ─────────────────────────────────
  const filtered = photos.filter((p) => {
    if (filter === "pending" && p.approved) return false;
    if (filter === "approved" && !p.approved) return false;
    if (tagFilter && !p.tags.some((t) => t.id === tagFilter)) return false;
    return true;
  });

  const pendingCount = photos.filter((p) => !p.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Photo Manager</h1>
          <p className="text-ivory/50 text-sm">
            {photos.length} photos · {pendingCount} pending · {allTags.length} tags
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-gold text-sm px-4 py-2"
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
          <button
            onClick={() => setShowTagForm(!showTagForm)}
            className="btn-outline text-sm px-4 py-2"
          >
            {showTagForm ? "Cancel" : "+ New Tag"}
          </button>
        </div>
      </div>

      {/* Tag Creation Form */}
      {showTagForm && (
        <form onSubmit={handleCreateTag} className="card-celestial mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-ivory/70 text-xs mb-1">Tag Name</label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="input-celestial w-full text-sm"
              placeholder="e.g. Ceremony, Ashley, Reception..."
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Type</label>
            <select value={newTagType} onChange={(e) => setNewTagType(e.target.value)} className="input-celestial text-sm">
              {TAG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Color</label>
            <div className="flex gap-1">
              {TAG_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setNewTagColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    newTagColor === c ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-gold text-sm px-4 py-2">Create Tag</button>
        </form>
      )}

      {/* Existing Tags */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <p className="text-ivory/50 text-xs mb-2">Tags (click to filter)</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter(null)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                tagFilter === null
                  ? "bg-gold/20 text-gold border-gold"
                  : "bg-royal/20 text-ivory/50 border-gold/10 hover:border-gold/30"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => {
              const typeInfo = TAG_TYPES.find((t) => t.value === tag.type);
              return (
                <button key={tag.id} onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors group flex items-center gap-1 ${
                    tagFilter === tag.id ? "border-white/50 text-white" : "border-transparent text-ivory/70 hover:text-ivory"
                  }`}
                  style={{
                    backgroundColor: tagFilter === tag.id ? tag.color + "40" : tag.color + "20",
                    borderColor: tagFilter === tag.id ? tag.color : "transparent",
                  }}
                >
                  <span>{typeInfo?.icon}</span>
                  <span>{tag.name}</span>
                  <span onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id); }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 cursor-pointer" title="Delete tag"
                  >×</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              filter === f
                ? "bg-gold/20 text-gold border border-gold"
                : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1 bg-gold text-midnight px-1.5 py-0.5 rounded-full text-xs">{pendingCount}</span>
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
            <div key={photo.id}
              className={`relative group rounded-lg overflow-hidden border ${
                photo.approved ? "border-gold/10" : "border-yellow-500/30"
              }`}
            >
              <img src={photo.url} alt={photo.caption || "Photo"} className="w-full h-48 object-cover" />

              {/* Tags below image */}
              {photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-midnight/90">
                  {photo.tags.map((tag) => (
                    <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white/90"
                      style={{ backgroundColor: tag.color + "60" }}
                    >{tag.name}</span>
                  ))}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-midnight/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {photo.caption && (
                  <p className="text-ivory text-xs text-center mb-1">{photo.caption}</p>
                )}
                {photo.uploadedBy && (
                  <p className="text-ivory/50 text-xs">by {photo.uploadedBy}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => openEditModal(photo)}
                    className="bg-gold/80 text-midnight px-3 py-1 rounded text-xs hover:bg-gold">
                    Edit
                  </button>
                  <button onClick={() => openTagModal(photo)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                    🏷️ Tags
                  </button>
                  <button onClick={() => toggleApproval(photo)}
                    className={`px-3 py-1 rounded text-xs text-white ${
                      photo.approved
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {photo.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button onClick={() => handleDelete(photo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
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
        <div className="text-center py-12 text-ivory/40">No photos found.</div>
      )}

      {/* ─── Edit Photo Modal ─────────────────────── */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-gold font-serif text-xl">Edit Photo</h3>

            <div className="flex justify-center">
              <img src={editingPhoto.url} alt="" className="h-40 rounded-lg object-cover" />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Caption</label>
              <input
                type="text"
                value={editForm.caption}
                onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                className="input-celestial w-full"
                placeholder="Photo caption"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="input-celestial w-full"
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} className="btn-gold flex-1 py-2">Save Changes</button>
              <button onClick={() => setEditingPhoto(null)} className="btn-outline flex-1 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tag Assignment Modal ─────────────────── */}
      {taggingPhotoId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-gold font-serif text-xl mb-4">Manage Tags</h3>

            {allTags.length > 0 ? (
              <div className="space-y-2 mb-6">
                {TAG_TYPES.filter((t) => allTags.some((tag) => tag.type === t.value)).map((typeInfo) => (
                  <div key={typeInfo.value}>
                    <p className="text-ivory/40 text-xs uppercase tracking-wider mb-1">{typeInfo.icon} {typeInfo.label}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {allTags.filter((tag) => tag.type === typeInfo.value).map((tag) => (
                        <button key={tag.id} onClick={() => toggleTagSelection(tag.id)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selectedTagIds.includes(tag.id)
                              ? "border-white/50 text-white scale-105"
                              : "border-transparent text-ivory/60 hover:text-ivory"
                          }`}
                          style={{
                            backgroundColor: selectedTagIds.includes(tag.id) ? tag.color + "50" : tag.color + "15",
                            borderColor: selectedTagIds.includes(tag.id) ? tag.color : "transparent",
                          }}
                        >{tag.name}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ivory/40 text-sm mb-6">
                No tags created yet. Create a tag first using the &quot;+ New Tag&quot; button.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={() => setTaggingPhotoId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
              <button onClick={handleSaveTags} className="btn-gold text-sm px-4 py-2">Save Tags</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
