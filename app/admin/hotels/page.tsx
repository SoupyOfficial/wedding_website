"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, Modal, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface Hotel {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  bookingLink: string;
  blockCode: string;
  blockDeadline: string | null;
  notes: string;
  distanceFromVenue: string;
  priceRange: string;
  amenities: string;
  sortOrder: number;
}

const emptyForm = {
  name: "", address: "", phone: "", website: "", bookingLink: "",
  blockCode: "", blockDeadline: "", notes: "", distanceFromVenue: "",
  priceRange: "", amenities: "", sortOrder: 0,
};

export default function AdminHotelsPage() {
  const [items, setItems] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Hotel | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/hotels");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openModal(item?: Hotel) {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        address: item.address,
        phone: item.phone,
        website: item.website,
        bookingLink: item.bookingLink,
        blockCode: item.blockCode,
        blockDeadline: item.blockDeadline ? item.blockDeadline.split("T")[0] : "",
        notes: item.notes,
        distanceFromVenue: item.distanceFromVenue,
        priceRange: item.priceRange,
        amenities: item.amenities,
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingItem(null);
      setForm({ ...emptyForm, sortOrder: items.length });
    }
    setError("");
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.name.trim()) return;
    setError("");
    try {
      const payload = {
        ...form,
        blockDeadline: form.blockDeadline || null,
      };
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/hotels/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
      } else {
        const res = await fetch("/api/v1/admin/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setItems((prev) => [...prev, data.data]);
      }
      setShowModal(false);
    } catch {
      setError("Failed to save hotel.");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/v1/admin/hotels/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* silently fail */ }
  }

  if (loading) return <LoadingState message="Loading hotels..." />;

  return (
    <div>
      <AdminPageHeader
        title="Hotels"
        subtitle={`${items.length} hotel${items.length !== 1 ? "s" : ""} — displayed on the Travel & Stay page`}
        actions={<button onClick={() => openModal()} className="btn-gold px-4 py-2 text-sm">+ Add Hotel</button>}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      {items.length === 0 ? (
        <EmptyState title="No hotels yet" subtitle="Add hotel recommendations for your guests." />
      ) : (
        <div className="space-y-2">
          {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-royal/40 flex items-center justify-center text-sm flex-shrink-0">🏨</div>
                <div>
                  <p className="text-ivory font-medium">{item.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ivory/50">
                    {item.priceRange && <span>{item.priceRange}</span>}
                    {item.distanceFromVenue && <span>{item.distanceFromVenue} from venue</span>}
                    {item.blockCode && <span>Block: <span className="font-mono text-gold/70">{item.blockCode}</span></span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(item)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                <ConfirmButton onConfirm={() => deleteItem(item.id)} message="Delete this hotel?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">
                  Remove
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingItem ? "Edit Hotel" : "Add Hotel"} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Hotel Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-celestial w-full" placeholder="e.g. Hilton Orlando" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-celestial w-full" />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-celestial w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Website URL</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-celestial w-full" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Booking Link</label>
                <input type="url" value={form.bookingLink} onChange={(e) => setForm({ ...form, bookingLink: e.target.value })} className="input-celestial w-full" placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Block Code</label>
                <input type="text" value={form.blockCode} onChange={(e) => setForm({ ...form, blockCode: e.target.value })} className="input-celestial w-full" />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Block Deadline</label>
                <input type="date" value={form.blockDeadline} onChange={(e) => setForm({ ...form, blockDeadline: e.target.value })} className="input-celestial w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Price Range</label>
                <input type="text" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} className="input-celestial w-full" placeholder="e.g. $120-180/night" />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Distance from Venue</label>
                <input type="text" value={form.distanceFromVenue} onChange={(e) => setForm({ ...form, distanceFromVenue: e.target.value })} className="input-celestial w-full" placeholder="e.g. 5 minutes" />
              </div>
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Amenities</label>
              <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="input-celestial w-full" placeholder="Pool, WiFi, Breakfast..." />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-celestial w-full" rows={2} placeholder="Additional info for guests..." />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveItem} className="btn-gold flex-1 py-2">{editingItem ? "Save Changes" : "Add Hotel"}</button>
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-2">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
