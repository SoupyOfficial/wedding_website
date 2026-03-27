"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Modal, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface RegistryItem {
  id: string;
  name: string;
  url: string;
  iconUrl: string | null;
  sortOrder: number;
  itemType: string;
  price: number | null;
  totalNeeded: number | null;
  totalBought: number;
  goalAmount: number | null;
  raisedAmount: number;
  description: string | null;
  status: string;
}

interface Contribution {
  id: string;
  registryItemId: string;
  guestName: string;
  guestEmail: string | null;
  amount: number | null;
  status: string;
  createdAt: string;
}

export default function AdminRegistryPage() {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ 
    name: "", url: "", iconUrl: "", sortOrder: 0,
    itemType: "store", price: "", totalNeeded: "", totalBought: 0, 
    goalAmount: "", raisedAmount: 0, description: "", status: "active"
  });

  // Contributions modal
  const [showContribs, setShowContribs] = useState(false);
  const [contribItem, setContribItem] = useState<RegistryItem | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contribLoading, setContribLoading] = useState(false);

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
        itemType: item.itemType || "store",
        price: item.price ? String(item.price) : "",
        totalNeeded: item.totalNeeded ? String(item.totalNeeded) : "",
        totalBought: item.totalBought || 0,
        goalAmount: item.goalAmount ? String(item.goalAmount) : "",
        raisedAmount: item.raisedAmount || 0,
        description: item.description || "",
        status: item.status || "active"
      });
    } else {
      setEditingItem(null);
      setForm({ 
        name: "", url: "", iconUrl: "", sortOrder: items.length,
        itemType: "store", price: "", totalNeeded: "", totalBought: 0, 
        goalAmount: "", raisedAmount: 0, description: "", status: "active"
      });
    }
    setError("");
    setFormError("");
    setShowModal(true);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setFormError("");
    setSaving(true);
    
    // Process form types
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      totalNeeded: form.totalNeeded ? parseInt(form.totalNeeded) : null,
      goalAmount: form.goalAmount ? parseFloat(form.goalAmount) : null,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/registry/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
        }
      } else {
        const res = await fetch("/api/v1/admin/registry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => [...prev, data.data]);
      }
      setShowModal(false);
    } catch {
      setFormError("Failed to save registry item.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/v1/admin/registry/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  async function viewContributions(item: RegistryItem) {
    setContribItem(item);
    setShowContribs(true);
    setContribLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/registry/${item.id}/contributions`);
      const data = await res.json();
      if (data.success) setContributions(data.data);
    } catch { /* silently fail */ }
    finally { setContribLoading(false); }
  }

  if (loading) {
    return <LoadingState message="Loading registry items..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Registry & Funds"
        subtitle={`${items.length} items linked`}
        actions={<button onClick={() => openModal()} className="btn-gold px-4 py-2 text-sm">+ Add Item/Fund</button>}
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
                    <div className="w-8 h-8 rounded bg-royal/40 flex items-center justify-center text-sm flex-shrink-0">{item.itemType === 'fund' ? '??' : item.itemType === 'product' ? '???' : '??'}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-ivory font-medium">{item.name}</p>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-gold/20 text-gold">{item.itemType}</span>
                    </div>
                    {item.itemType === 'fund' && item.goalAmount && (
                      <p className="text-xs text-ivory/60 mt-0.5">Fund: ${item.raisedAmount} / ${item.goalAmount}</p>
                    )}
                    {item.itemType === 'product' && item.totalNeeded && (
                      <p className="text-xs text-ivory/60 mt-0.5">Product: {item.totalBought} / {item.totalNeeded} bought</p>
                    )}
                    {item.url && item.itemType === 'store' && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold text-xs underline truncate block max-w-[300px]">
                        {item.url}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.itemType !== 'store' && (
                    <button onClick={() => viewContributions(item)} className="text-ivory/40 hover:text-ivory text-xs transition-colors">Contributions</button>
                  )}
                  <button onClick={() => openModal(item)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                  <ConfirmButton onConfirm={() => deleteItem(item.id)} message="Delete this item?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                    Remove
                  </ConfirmButton>
                </div>
              </div>
            ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingItem ? "Edit Registry Item" : "Add Registry Item"} onClose={() => setShowModal(false)}>
          <form onSubmit={saveItem} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
            {formError && <Alert type="error" message={formError} className="mb-3" />}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-ivory/70 text-xs mb-1">Item Type</label>
                <select
                  value={form.itemType}
                  onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                  className="input-celestial w-full"
                >
                  <option value="store">General Store Link</option>
                  <option value="product">Specific Product</option>
                  <option value="fund">Cash Fund / Donation</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-ivory/70 text-xs mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-celestial w-full"
                >
                  <option value="active">Active</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Title / Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-celestial w-full"
                placeholder={form.itemType === 'fund' ? "e.g. Honeymoon Fund" : "e.g. Target"}
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Primary URL Link</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="input-celestial w-full"
                placeholder="https://..."
              />
              <p className="text-[10px] text-ivory/40 mt-1">
                {form.itemType === 'fund' ? "Link to Venmo, PayPal, or GoFundMe." : "Direct link to the store or product."}
              </p>
            </div>

            <div>
              <label className="block text-ivory/70 text-xs mb-1">Description (Optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-celestial w-full min-h-[80px]"
                placeholder="Tell your guests what this fund or item is for."
              />
            </div>

            {form.itemType === 'product' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-ivory/70 text-xs mb-1">Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-celestial w-full"
                    placeholder="25.00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-ivory/70 text-xs mb-1">Number Needed</label>
                  <input
                    type="number"
                    value={form.totalNeeded}
                    onChange={(e) => setForm({ ...form, totalNeeded: e.target.value })}
                    className="input-celestial w-full"
                    placeholder="1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-ivory/70 text-xs mb-1">Number Bought</label>
                  <input
                    type="number"
                    value={form.totalBought}
                    onChange={(e) => setForm({ ...form, totalBought: parseInt(e.target.value) || 0 })}
                    className="input-celestial w-full"
                  />
                </div>
              </div>
            )}

            {form.itemType === 'fund' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-ivory/70 text-xs mb-1">Goal Amount (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.goalAmount}
                    onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
                    className="input-celestial w-full"
                    placeholder="1000.00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-ivory/70 text-xs mb-1">Amount Raised</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.raisedAmount}
                    onChange={(e) => setForm({ ...form, raisedAmount: parseFloat(e.target.value) || 0 })}
                    className="input-celestial w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-ivory/70 text-xs mb-1">Icon URL</label>
                <input
                  type="url"
                  value={form.iconUrl}
                  onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                  className="input-celestial w-full"
                  placeholder="https://... (logo image)"
                />
              </div>
              <div className="w-24">
                <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="input-celestial w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
                {saving ? "Saving..." : editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showContribs && contribItem && (
        <Modal title={`Contributions — ${contribItem.name}`} onClose={() => setShowContribs(false)}>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {contribLoading ? (
              <p className="text-ivory/60 text-center py-8">Loading...</p>
            ) : contributions.length === 0 ? (
              <p className="text-ivory/60 text-center py-8">No contributions yet.</p>
            ) : (
              <div className="space-y-2">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-3">
                    <div>
                      <p className="text-ivory text-sm font-medium">{c.guestName}</p>
                      {c.guestEmail && <p className="text-ivory/50 text-xs">{c.guestEmail}</p>}
                    </div>
                    <div className="text-right">
                      {c.amount != null && <p className="text-gold text-sm font-medium">${c.amount.toLocaleString()}</p>}
                      <p className="text-ivory/40 text-xs">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
