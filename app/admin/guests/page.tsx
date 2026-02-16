"use client";

import { useState, useEffect, useCallback } from "react";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  rsvpRespondedAt: string | null;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  plusOneAttending: boolean;
  mealPreference: string | null;
  dietaryNeeds: string | null;
  songRequest: string | null;
  childrenCount: number;
  childrenNames: string | null;
  tableNumber: number | null;
  group: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY_GUEST: Omit<Guest, "id" | "createdAt" | "rsvpRespondedAt"> = {
  firstName: "",
  lastName: "",
  email: null,
  phone: null,
  rsvpStatus: "pending",
  plusOneAllowed: false,
  plusOneName: null,
  plusOneAttending: false,
  mealPreference: null,
  dietaryNeeds: null,
  songRequest: null,
  childrenCount: 0,
  childrenNames: null,
  tableNumber: null,
  group: null,
  notes: null,
};

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/guests");
      const data = await res.json();
      if (data.data) setGuests(data.data);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  function openNew() {
    setEditing({ id: "", createdAt: "", rsvpRespondedAt: null, ...EMPTY_GUEST } as Guest);
    setIsNew(true);
    setFormError("");
  }

  function openEdit(g: Guest) {
    setEditing({ ...g });
    setIsNew(false);
    setFormError("");
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setFormError("");
  }

  function setField<K extends keyof Guest>(key: K, val: Guest[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: val } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError("");

    try {
      const url = isNew ? "/api/v1/admin/guests" : `/api/v1/admin/guests/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editing.firstName,
          lastName: editing.lastName,
          email: editing.email || undefined,
          phone: editing.phone || undefined,
          group: editing.group || undefined,
          rsvpStatus: editing.rsvpStatus,
          plusOneAllowed: editing.plusOneAllowed,
          plusOneName: editing.plusOneName || undefined,
          plusOneAttending: editing.plusOneAttending,
          mealPreference: editing.mealPreference || undefined,
          dietaryNeeds: editing.dietaryNeeds || undefined,
          songRequest: editing.songRequest || undefined,
          childrenCount: editing.childrenCount,
          childrenNames: editing.childrenNames || undefined,
          tableNumber: editing.tableNumber || undefined,
          notes: editing.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save.");
        return;
      }

      closeEditor();
      fetchGuests();
    } catch {
      setFormError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this guest?")) return;
    try {
      await fetch(`/api/v1/admin/guests/${id}`, { method: "DELETE" });
      if (editing?.id === id) closeEditor();
      fetchGuests();
    } catch {
      /* silently fail */
    }
  }

  const filteredGuests = guests.filter((g) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "attending" && g.rsvpStatus === "attending") ||
      (filter === "declined" && g.rsvpStatus === "declined") ||
      (filter === "pending" && g.rsvpStatus === "pending");
    const matchesSearch =
      !search ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const attendingCount = guests.filter((g) => g.rsvpStatus === "attending").length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Guest Manager</h1>
          <p className="text-ivory/50 text-sm">
            {guests.length} guests &bull; {attendingCount} attending &bull; {declinedCount} declined &bull; {pendingCount} pending
          </p>
        </div>
        <button onClick={openNew} className="btn-gold px-4 py-2 text-sm">+ Add Guest</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-celestial flex-1 min-w-[200px]" placeholder="Search guests..." />
        <div className="flex gap-2">
          {(["all", "attending", "declined", "pending"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded text-sm transition-colors ${filter === f ? "bg-gold/20 text-gold border border-gold" : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading guests...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">Name</th>
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">Email</th>
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">RSVP</th>
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">Group</th>
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">Plus One</th>
                <th className="text-left py-3 px-2 text-ivory/50 font-normal">Table</th>
                <th className="text-right py-3 px-2 text-ivory/50 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gold/5 hover:bg-royal/10 transition-colors">
                  <td className="py-3 px-2 text-ivory">{guest.firstName} {guest.lastName}</td>
                  <td className="py-3 px-2 text-ivory/60">{guest.email || "—"}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded ${guest.rsvpStatus === "attending" ? "text-green-400 bg-green-900/30" : guest.rsvpStatus === "declined" ? "text-red-400 bg-red-900/30" : "text-yellow-400 bg-yellow-900/30"}`}>
                      {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-ivory/50">{guest.group || "—"}</td>
                  <td className="py-3 px-2 text-ivory/50">{guest.plusOneAllowed ? guest.plusOneName || "Allowed" : "—"}</td>
                  <td className="py-3 px-2 text-ivory/50">{guest.tableNumber || "—"}</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button onClick={() => openEdit(guest)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                    <button onClick={() => handleDelete(guest.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && <div className="text-center py-8 text-ivory/40">No guests found.</div>}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-gold font-serif text-xl mb-4">{isNew ? "Add Guest" : `Edit: ${editing.firstName} ${editing.lastName}`}</h3>
            {formError && <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">First Name *</label>
                  <input type="text" value={editing.firstName} onChange={(e) => setField("firstName", e.target.value)} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Last Name *</label>
                  <input type="text" value={editing.lastName} onChange={(e) => setField("lastName", e.target.value)} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Email</label>
                  <input type="email" value={editing.email || ""} onChange={(e) => setField("email", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Phone</label>
                  <input type="text" value={editing.phone || ""} onChange={(e) => setField("phone", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Group</label>
                  <input type="text" value={editing.group || ""} onChange={(e) => setField("group", e.target.value || null)} className="input-celestial w-full" placeholder="e.g., Family, College" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">RSVP Status</label>
                  <select value={editing.rsvpStatus} onChange={(e) => setField("rsvpStatus", e.target.value)} className="input-celestial w-full">
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Table Number</label>
                  <input type="number" value={editing.tableNumber ?? ""} onChange={(e) => setField("tableNumber", e.target.value ? parseInt(e.target.value) : null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Meal Preference</label>
                  <input type="text" value={editing.mealPreference || ""} onChange={(e) => setField("mealPreference", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Dietary Needs</label>
                  <input type="text" value={editing.dietaryNeeds || ""} onChange={(e) => setField("dietaryNeeds", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Song Request</label>
                  <input type="text" value={editing.songRequest || ""} onChange={(e) => setField("songRequest", e.target.value || null)} className="input-celestial w-full" />
                </div>
              </div>

              <div className="border-t border-gold/10 pt-4">
                <label className="flex items-center gap-2 text-ivory/70 text-sm mb-3">
                  <input type="checkbox" checked={editing.plusOneAllowed} onChange={(e) => setField("plusOneAllowed", e.target.checked)} className="w-4 h-4" />
                  Allow Plus One
                </label>
                {editing.plusOneAllowed && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-ivory/70 text-xs mb-1">Plus One Name</label>
                      <input type="text" value={editing.plusOneName || ""} onChange={(e) => setField("plusOneName", e.target.value || null)} className="input-celestial w-full" />
                    </div>
                    <label className="flex items-center gap-2 text-ivory/70 text-sm">
                      <input type="checkbox" checked={editing.plusOneAttending} onChange={(e) => setField("plusOneAttending", e.target.checked)} className="w-4 h-4" />
                      Plus One Attending
                    </label>
                  </div>
                )}
              </div>

              <div className="border-t border-gold/10 pt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Children Count</label>
                  <input type="number" min="0" value={editing.childrenCount} onChange={(e) => setField("childrenCount", parseInt(e.target.value) || 0)} className="input-celestial w-full" />
                </div>
                {editing.childrenCount > 0 && (
                  <div>
                    <label className="block text-ivory/70 text-xs mb-1">Children Names</label>
                    <input type="text" value={editing.childrenNames || ""} onChange={(e) => setField("childrenNames", e.target.value || null)} className="input-celestial w-full" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-ivory/70 text-xs mb-1">Notes</label>
                <textarea value={editing.notes || ""} onChange={(e) => setField("notes", e.target.value || null)} className="input-celestial w-full h-20 resize-none" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditor} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add Guest" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
