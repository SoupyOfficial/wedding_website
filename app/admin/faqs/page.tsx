"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Modal, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export default function AdminFAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: 0 });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/content/faqs");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openModal(item?: FAQ) {
    if (item) {
      setEditingItem(item);
      setForm({ question: item.question, answer: item.answer, sortOrder: item.sortOrder });
    } else {
      setEditingItem(null);
      setForm({ question: "", answer: "", sortOrder: items.length });
    }
    setError("");
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setError("");
    try {
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/content/faqs/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
      } else {
        const res = await fetch("/api/v1/admin/content/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => [...prev, data.data]);
      }
      setShowModal(false);
    } catch {
      setError("Failed to save FAQ.");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/v1/admin/content/faqs/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  if (loading) return <LoadingState message="Loading FAQs..." />;

  return (
    <div>
      <AdminPageHeader
        title="FAQs"
        subtitle={`${items.length} question${items.length !== 1 ? "s" : ""} — displayed on the FAQ page`}
        actions={<button onClick={() => openModal()} className="btn-gold px-4 py-2 text-sm">+ Add FAQ</button>}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      {items.length === 0 ? (
        <EmptyState title="No FAQs yet" subtitle="Add frequently asked questions for your guests." />
      ) : (
        <div className="space-y-2">
          {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
            <div key={item.id} className="bg-royal/20 border border-gold/10 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded bg-royal/40 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">❓</div>
                  <div className="flex-1">
                    <p className="text-gold font-serif">{item.question}</p>
                    <p className="text-ivory/60 text-sm mt-1 line-clamp-2">{item.answer}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openModal(item)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                  <ConfirmButton onConfirm={() => deleteItem(item.id)} message="Delete this FAQ?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                    Remove
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingItem ? "Edit FAQ" : "Add FAQ"} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Question *</label>
              <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="input-celestial w-full" placeholder="e.g. What should I wear?" />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Answer *</label>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="input-celestial w-full" rows={4} placeholder="The answer to the question..." />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveItem} className="btn-gold flex-1 py-2">{editingItem ? "Save Changes" : "Add FAQ"}</button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-2">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
