"use client";

import { useState, useEffect, useCallback } from "react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  eventType: string;
  sortOrder: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
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

const EMPTY_FAQ: Omit<FAQ, "id"> = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<"timeline" | "faqs">("timeline");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [timelineRes, faqRes] = await Promise.all([
        fetch("/api/v1/admin/content/timeline"),
        fetch("/api/v1/admin/content/faqs"),
      ]);
      const timelineData = await timelineRes.json();
      const faqData = await faqRes.json();
      if (timelineData.data) setTimeline(timelineData.data);
      if (faqData.data) setFaqs(faqData.data);
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ----- Timeline CRUD -----
  function openNewTimeline() {
    setEditingTimeline({ id: "", ...EMPTY_TIMELINE, sortOrder: timeline.length } as TimelineEvent);
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
      fetchData();
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTimeline(id: string) {
    if (!confirm("Remove this timeline event?")) return;
    try {
      await fetch(`/api/v1/admin/content/timeline/${id}`, { method: "DELETE" });
      if (editingTimeline?.id === id) setEditingTimeline(null);
      fetchData();
    } catch { /* silently fail */ }
  }

  // ----- FAQ CRUD -----
  function openNewFAQ() {
    setEditingFAQ({ id: "", ...EMPTY_FAQ, sortOrder: faqs.length } as FAQ);
    setIsNew(true);
  }

  function openEditFAQ(f: FAQ) {
    setEditingFAQ({ ...f });
    setIsNew(false);
  }

  async function handleSaveFAQ(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFAQ) return;
    setSaving(true);
    try {
      const url = isNew ? "/api/v1/admin/content/faqs" : `/api/v1/admin/content/faqs/${editingFAQ.id}`;
      const method = isNew ? "POST" : "PUT";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editingFAQ.question,
          answer: editingFAQ.answer,
          sortOrder: editingFAQ.sortOrder,
        }),
      });
      setEditingFAQ(null);
      setIsNew(false);
      fetchData();
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFAQ(id: string) {
    if (!confirm("Remove this FAQ?")) return;
    try {
      await fetch(`/api/v1/admin/content/faqs/${id}`, { method: "DELETE" });
      if (editingFAQ?.id === id) setEditingFAQ(null);
      fetchData();
    } catch { /* silently fail */ }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Content Manager</h1>
        <p className="text-ivory/50 text-sm">Manage timeline events and FAQs</p>
      </div>

      <div className="flex items-center justify-between mb-6 border-b border-gold/10 pb-4">
        <div className="flex gap-2">
          {(["timeline", "faqs"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded text-sm transition-colors ${tab === t ? "bg-gold/20 text-gold" : "text-ivory/50 hover:text-ivory"}`}>
              {t === "timeline" ? `Timeline (${timeline.length})` : `FAQs (${faqs.length})`}
            </button>
          ))}
        </div>
        <button onClick={tab === "timeline" ? openNewTimeline : openNewFAQ} className="btn-gold px-4 py-2 text-sm">
          + Add {tab === "timeline" ? "Event" : "FAQ"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <>
          {/* Timeline Tab */}
          {tab === "timeline" && (
            <div className="space-y-2">
              {timeline.length > 0 ? timeline.map((event) => (
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
                    <button onClick={() => handleDeleteTimeline(event.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-ivory/40">No timeline events yet.</div>
              )}
            </div>
          )}

          {/* FAQs Tab */}
          {tab === "faqs" && (
            <div className="space-y-2">
              {faqs.length > 0 ? faqs.map((faq) => (
                <div key={faq.id} className="bg-royal/20 border border-gold/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gold font-serif">{faq.question}</p>
                      <p className="text-ivory/60 text-sm mt-1">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEditFAQ(faq)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                      <button onClick={() => handleDeleteFAQ(faq.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-ivory/40">No FAQs yet.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Timeline Edit Modal */}
      {editingTimeline && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-gold font-serif text-xl mb-4">{isNew ? "Add Timeline Event" : `Edit: ${editingTimeline.title}`}</h3>
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
          </div>
        </div>
      )}

      {/* FAQ Edit Modal */}
      {editingFAQ && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-gold font-serif text-xl mb-4">{isNew ? "Add FAQ" : "Edit FAQ"}</h3>
            <form onSubmit={handleSaveFAQ} className="space-y-4">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Question *</label>
                <input type="text" value={editingFAQ.question} onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })} className="input-celestial w-full" required />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Answer *</label>
                <textarea value={editingFAQ.answer} onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })} className="input-celestial w-full h-24 resize-none" required />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
                <input type="number" value={editingFAQ.sortOrder} onChange={(e) => setEditingFAQ({ ...editingFAQ, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-24" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setEditingFAQ(null); setIsNew(false); }} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add FAQ" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
