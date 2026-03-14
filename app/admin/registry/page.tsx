"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Modal, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface RegistryItem {
  id: string;
  name: string;
  url: string;
  iconUrl: string | null;
  sortOrder: number;
}

export default function AdminRegistryPage() {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistryItem | null>(null);
  const [form, setForm] = useState({ name: "", url: "", iconUrl: "", sortOrder: 0 });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/registry");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openModal(item?: RegistryItem) {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        url: item.url,
        iconUrl: item.iconUrl || "",
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingItem(null);
      setForm({ name: "", url: "", iconUrl: "", sortOrder: items.length });
    }
    setError("");
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.name.trim()) return;
    setError("");
    try {
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/registry/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
        }
      } else {
        const res = await fetch("/api/v1/admin/registry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => [...prev, data.data]);
      }
      setShowModal(false);
    } catch {
      setError("Failed to save registry item.");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/v1/admin/registry/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  if (loading) {
    return <LoadingState message="Loading registry items..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Registry"
        subtitle={`${items.length} registry items`}
        actions={<button onClick={() => openModal()} className="btn-gold px-4 py-2 text-sm">+ Add Registry Item</button>}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      {items.length === 0 ? (
        <EmptyState title="No registry items yet" subtitle="Add your first registry link above." />
      ) : (
        <div className="space-y-2">
          {items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {item.iconUrl ? (
                    <img src={item.iconUrl} alt="" className="w-8 h-8 rounded object-contain bg-white/10 p-0.5 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-royal/40 flex items-center justify-center text-sm flex-shrink-0">🎁</div>
                  )}
                  <div>
                    <p className="text-ivory font-medium">{item.name}</p>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold text-xs underline truncate block max-w-[300px]">
                        {item.url}
                      </a>
                    ) : (
                      <span className="text-ivory/30 text-xs">No URL</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(item)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                  <ConfirmButton onConfirm={() => deleteItem(item.id)} message="Delete this registry item?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                    Remove
                  </ConfirmButton>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ─── Modal ────────────────────────────────── */}
      {showModal && (
        <Modal title={editingItem ? "Edit Registry Item" : "Add Registry Item"} onClose={() => setShowModal(false)}>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-celestial w-full"
                placeholder="e.g. Target, Amazon, Crate & Barrel"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Registry URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="input-celestial w-full"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Icon URL</label>
              <input
                type="url"
                value={form.iconUrl}
                onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                className="input-celestial w-full"
                placeholder="https://... (logo image)"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="input-celestial w-full"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveItem} className="btn-gold flex-1 py-2">
                {editingItem ? "Save Changes" : "Add Item"}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-2">
                Cancel
              </button>
            </div>
        </Modal>
      )}
    </div>
  );
}
