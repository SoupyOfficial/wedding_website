"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, FilterBar, Modal, LoadingState, EmptyState } from "@/components/ui";

interface GuestBookEntry {
  id: string;
  name: string;
  message: string;
  isVisible: boolean;
  createdAt: string;
}

const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "pending" as const, label: "Pending" },
  { value: "approved" as const, label: "Approved" },
];

export default function AdminGuestBookPage() {
  const { data: entries, loading, setData: setEntries } = useAdminFetch<GuestBookEntry>("/api/v1/admin/guest-book");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  // Edit modal
  const [editingEntry, setEditingEntry] = useState<GuestBookEntry | null>(null);
  const [editForm, setEditForm] = useState({ name: "", message: "" });

  // ── Toggle Visibility ─────────────────────────
  async function toggleVisibility(entry: GuestBookEntry) {
    try {
      const res = await fetch(`/api/v1/admin/guest-book/${entry.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !entry.isVisible }),
      });
      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, isVisible: !entry.isVisible } : e))
        );
      }
    } catch { /* silently fail */ }
  }

  // ── Edit Entry ────────────────────────────────
  function openEditModal(entry: GuestBookEntry) {
    setEditingEntry(entry);
    setEditForm({ name: entry.name, message: entry.message });
  }

  async function saveEdit() {
    if (!editingEntry || !editForm.name.trim() || !editForm.message.trim()) return;
    try {
      const res = await fetch(`/api/v1/admin/guest-book/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((e) => (e.id === editingEntry.id ? { ...e, ...editForm } : e))
        );
        setEditingEntry(null);
      }
    } catch { /* silently fail */ }
  }

  // ── Delete Entry ──────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`/api/v1/admin/guest-book/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silently fail */ }
  }

  // ── Filtering ─────────────────────────────────
  const filtered = entries.filter((e) => {
    if (filter === "pending") return !e.isVisible;
    if (filter === "approved") return e.isVisible;
    return true;
  });

  const pendingCount = entries.filter((e) => !e.isVisible).length;

  return (
    <div>
      <AdminPageHeader
        title="Guest Book"
        subtitle={`${entries.length} entries · ${pendingCount} pending approval`}
      />

      {/* Filters */}
      <div className="mb-6">
        <FilterBar filters={FILTERS} active={filter} onChange={setFilter} variant="button" />
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`bg-royal/20 border rounded-lg p-4 ${
                entry.isVisible ? "border-gold/10" : "border-yellow-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-ivory/80 text-sm mb-2">
                    &ldquo;{entry.message}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ivory/40 flex-wrap">
                    <span className="text-gold/70">— {entry.name}</span>
                    <span>·</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        entry.isVisible
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {entry.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="text-xs px-3 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVisibility(entry)}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      entry.isVisible
                        ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                        : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                    }`}
                  >
                    {entry.isVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No entries found" />
      )}

      {/* ─── Edit Modal ───────────────────────────── */}
      {editingEntry && (
        <Modal title="Edit Entry" onClose={() => setEditingEntry(null)}>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-celestial w-full"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Message</label>
              <textarea
                value={editForm.message}
                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                className="input-celestial w-full h-32 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} className="btn-gold flex-1 py-2">Save Changes</button>
              <button onClick={() => setEditingEntry(null)} className="btn-outline flex-1 py-2">Cancel</button>
            </div>
        </Modal>
      )}
    </div>
  );
}
