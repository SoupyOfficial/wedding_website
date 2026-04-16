"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Modal, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface Entertainment {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export default function AdminEntertainmentPage() {
  const [items, setItems] = useState<Entertainment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Entertainment | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", sortOrder: 0, isVisible: true });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/entertainment");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openModal(item?: Entertainment) {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name, description: item.description, icon: item.icon || "", sortOrder: item.sortOrder, isVisible: item.isVisible });
    } else {
      setEditingItem(null);
      setForm({ name: "", description: "", icon: "", sortOrder: items.length, isVisible: true });
    }
    setError("");
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.name.trim()) return;
    setError("");
    try {
      const payload = { ...form, icon: form.icon || null };
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/entertainment/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
      } else {
        const res = await fetch("/api/v1/admin/entertainment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => [...prev, data.data]);
      }
      setShowModal(false);
    } catch {
      setError("Failed to save entertainment item.");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/v1/admin/entertainment/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  async function toggleVisibility(item: Entertainment) {
    try {
      const res = await fetch(`/api/v1/admin/entertainment/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !item.isVisible }),
      });
      const data = await res.json();
      if (data.success) setItems((prev) => prev.map((i) => (i.id === item.id ? data.data : i)));
    } catch { /* silently fail */ }
  }

  if (loading) return <LoadingState message="Loading entertainment..." />;

  return (
    <div>
      <AdminPageHeader
        title="Entertainment"
        subtitle={`${items.length} activit${items.length !== 1 ? "ies" : "y"} — displayed on the Entertainment page`}
        actions={<button onClick={() => openModal()} className="btn-gold px-4 py-2 text-sm">+ Add Activity</button>}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      {items.length === 0 ? (
        <EmptyState title="No entertainment yet" subtitle="Add reception activities for your guests." />
      ) : (
        <div className="space-y-2">
          {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
            <div key={item.id} className={`flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4 ${!item.isVisible ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-royal/40 flex items-center justify-center text-sm flex-shrink-0">
                  {item.icon || "🎉"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-ivory font-medium">{item.name}</p>
                    {!item.isVisible && <span className="text-xs bg-ivory/10 text-ivory/40 px-2 py-0.5 rounded">Hidden</span>}
                  </div>
                  {item.description && <p className="text-ivory/50 text-xs line-clamp-1">{item.description}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleVisibility(item)} className={`text-xs transition-colors ${item.isVisible ? "text-green-400/60 hover:text-green-400" : "text-ivory/40 hover:text-ivory/60"}`}>
                  {item.isVisible ? "Visible" : "Hidden"}
                </button>
                <button onClick={() => openModal(item)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                <ConfirmButton onConfirm={() => deleteItem(item.id)} message="Delete this activity?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                  Remove
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingItem ? "Edit Activity" : "Add Activity"} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-celestial w-full" placeholder="e.g. Photo Booth, Lawn Games" />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-celestial w-full" rows={3} placeholder="What guests can expect..." />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-celestial w-full" placeholder="e.g. 📸 🎯 🎧" />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-full" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="accent-gold w-4 h-4" />
              <span className="text-ivory/70 text-sm">Visible on public Entertainment page</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={saveItem} className="btn-gold flex-1 py-2">{editingItem ? "Save Changes" : "Add Activity"}</button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-2">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
