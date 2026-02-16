"use client";

import { useState, useEffect, useCallback } from "react";

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
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.name.trim()) return;
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
      console.error("Failed to save registry item");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this registry item?")) return;
    try {
      const res = await fetch(`/api/v1/admin/registry/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-ivory/60 text-lg">Loading registry items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold">Registry</h1>
          <p className="text-ivory/50 text-sm mt-1">{items.length} registry items</p>
        </div>
        <button onClick={() => openModal()} className="btn-gold text-sm px-4 py-2">
          + Add Registry Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-ivory/40">
          <p className="text-lg mb-2">No registry items yet</p>
          <p className="text-sm">Add your first registry link above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gold/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-royal/30 text-gold/80 text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {items
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <tr key={item.id} className="hover:bg-royal/10 transition-colors">
                    <td className="px-4 py-3 text-ivory/40 font-mono">{item.sortOrder}</td>
                    <td className="px-4 py-3 text-ivory font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold/70 hover:text-gold underline truncate block max-w-[300px]"
                        >
                          {item.url}
                        </a>
                      ) : (
                        <span className="text-ivory/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.iconUrl ? (
                        <img
                          src={item.iconUrl}
                          alt=""
                          className="w-8 h-8 rounded object-contain bg-white/10 p-0.5"
                        />
                      ) : (
                        <span className="text-ivory/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal(item)}
                        className="text-xs px-2 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl text-gold">
              {editingItem ? "Edit Registry Item" : "Add Registry Item"}
            </h2>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-celestial w-full"
                placeholder="e.g. Target, Amazon, Crate & Barrel"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Registry URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="input-celestial w-full"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Icon URL</label>
              <input
                type="url"
                value={form.iconUrl}
                onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                className="input-celestial w-full"
                placeholder="https://... (logo image)"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Sort Order</label>
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
          </div>
        </div>
      )}
    </div>
  );
}
