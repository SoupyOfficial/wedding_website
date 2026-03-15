"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, LoadingState, EmptyState, ConfirmButton } from "@/components/ui";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  eventType: string;
  sortOrder: number;
}

const EMPTY_TIMELINE: Omit<TimelineEvent, "id"> = {
  title: "",
  description: "",
  time: "",
  icon: "",
  eventType: "wedding-day",
  sortOrder: 0,
};

export default function AdminContentPage() {
  const { data: timeline, loading, refetch } = useAdminFetch<TimelineEvent>("/api/v1/admin/content/timeline");

  // Editing state
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----- Timeline CRUD -----
  function openNewTimeline() {
    setEditingTimeline({ id: "", ...EMPTY_TIMELINE, sortOrder: (timeline ?? []).length } as TimelineEvent);
    setIsNew(true);
  }

  function openEditTimeline(t: TimelineEvent) {
    setEditingTimeline({ ...t });
    setIsNew(false);
  }

  async function handleSaveTimeline(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTimeline) return;
    setSaving(true);
    try {
      const url = isNew ? "/api/v1/admin/content/timeline" : `/api/v1/admin/content/timeline/${editingTimeline.id}`;
      const method = isNew ? "POST" : "PUT";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTimeline.title,
          description: editingTimeline.description || undefined,
          time: editingTimeline.time || undefined,
          icon: editingTimeline.icon || undefined,
          eventType: editingTimeline.eventType,
          sortOrder: editingTimeline.sortOrder,
        }),
      });
      setEditingTimeline(null);
      setIsNew(false);
      refetch();
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTimeline(id: string) {
    try {
      await fetch(`/api/v1/admin/content/timeline/${id}`, { method: "DELETE" });
      if (editingTimeline?.id === id) setEditingTimeline(null);
      refetch();
    } catch { /* silently fail */ }
  }

  return (
    <div>
      <AdminPageHeader
        title="Timeline"
        subtitle={`${(timeline ?? []).length} event${(timeline ?? []).length !== 1 ? "s" : ""} — displayed on the Event Details page`}
        actions={<button onClick={openNewTimeline} className="btn-gold px-4 py-2 text-sm">+ Add Event</button>}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-2">
          {(timeline ?? []).length > 0 ? (timeline ?? []).map((event) => (
            <div key={event.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{event.icon || "\u23F0"}</span>
                <div>
                  <p className="text-ivory font-medium">{event.title}</p>
                  <div className="flex gap-2 text-ivory/40 text-xs">
                    {event.time && <span>{event.time}</span>}
                    {event.description && <span>&bull; {event.description}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditTimeline(event)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                <ConfirmButton onConfirm={() => handleDeleteTimeline(event.id)} message="Remove this timeline event?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</ConfirmButton>
              </div>
            </div>
          )) : (
            <EmptyState title="No timeline events yet" subtitle="Add events to your wedding day timeline." />
          )}
        </div>
      )}

      {/* Timeline Edit Modal */}
      {editingTimeline && (
        <Modal title={isNew ? "Add Timeline Event" : `Edit: ${editingTimeline.title}`} onClose={() => { setEditingTimeline(null); setIsNew(false); }}>
            <form onSubmit={handleSaveTimeline} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-ivory/70 text-xs mb-1">Title *</label>
                  <input type="text" value={editingTimeline.title} onChange={(e) => setEditingTimeline({ ...editingTimeline, title: e.target.value })} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Time</label>
                  <input type="text" value={editingTimeline.time} onChange={(e) => setEditingTimeline({ ...editingTimeline, time: e.target.value })} className="input-celestial w-full" placeholder="e.g., 4:30 PM" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Icon Emoji</label>
                  <input type="text" value={editingTimeline.icon} onChange={(e) => setEditingTimeline({ ...editingTimeline, icon: e.target.value })} className="input-celestial w-full" placeholder="e.g., 💍" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-ivory/70 text-xs mb-1">Description</label>
                  <textarea value={editingTimeline.description} onChange={(e) => setEditingTimeline({ ...editingTimeline, description: e.target.value })} className="input-celestial w-full h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Event Type</label>
                  <select value={editingTimeline.eventType} onChange={(e) => setEditingTimeline({ ...editingTimeline, eventType: e.target.value })} className="input-celestial w-full">
                    <option value="wedding-day">Wedding Day</option>
                    <option value="pre-wedding">Pre-Wedding</option>
                    <option value="post-wedding">Post-Wedding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
                  <input type="number" value={editingTimeline.sortOrder} onChange={(e) => setEditingTimeline({ ...editingTimeline, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-full" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setEditingTimeline(null); setIsNew(false); }} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add Event" : "Save Changes"}</button>
              </div>
            </form>
        </Modal>
      )}

    </div>
  );
}
