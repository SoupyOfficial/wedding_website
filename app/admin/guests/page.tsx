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
  mealPreference: string | null;
  dietaryNeeds: string | null;
  tableNumber: number | null;
  group: string | null;
  notes: string | null;
  createdAt: string;
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Add form
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newPlusOne, setNewPlusOne] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/guests");
      const data = await res.json();
      if (data.data) setGuests(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    try {
      const res = await fetch("/api/v1/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newFirst,
          lastName: newLast,
          email: newEmail || undefined,
          group: newGroup || undefined,
          plusOneAllowed: newPlusOne,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Failed to add guest.");
        return;
      }

      setShowAdd(false);
      setNewFirst("");
      setNewLast("");
      setNewEmail("");
      setNewGroup("");
      setNewPlusOne(false);
      fetchGuests();
    } catch {
      setAddError("Something went wrong.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this guest?")) return;

    try {
      await fetch(`/api/v1/admin/guests/${id}`, { method: "DELETE" });
      fetchGuests();
    } catch {
      // silently fail
    }
  }

  const attendingCount = guests.filter((g) => g.rsvpStatus === "attending").length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Guest Manager</h1>
          <p className="text-ivory/50 text-sm">
            {guests.length} guests • {attendingCount} attending • {declinedCount} declined • {pendingCount} pending
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-gold px-4 py-2 text-sm"
        >
          + Add Guest
        </button>
      </div>

      {/* Add Guest Form */}
      {showAdd && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-6">
          <h3 className="text-gold font-serif text-lg mb-4">Add New Guest</h3>
          {addError && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
              {addError}
            </div>
          )}
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
              className="input-celestial"
              placeholder="First Name"
              required
            />
            <input
              type="text"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              className="input-celestial"
              placeholder="Last Name"
              required
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input-celestial"
              placeholder="Email (optional)"
            />
            <input
              type="text"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="input-celestial"
              placeholder="Group (e.g., Family, College)"
            />
            <label className="flex items-center gap-2 text-ivory/70 text-sm">
              <input
                type="checkbox"
                checked={newPlusOne}
                onChange={(e) => setNewPlusOne(e.target.checked)}
                className="w-4 h-4"
              />
              Allow Plus One
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="btn-outline px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="btn-gold px-4 py-2 text-sm">
                Add Guest
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-celestial flex-1 min-w-[200px]"
          placeholder="Search guests..."
        />
        <div className="flex gap-2">
          {(["all", "attending", "declined", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                filter === f
                  ? "bg-gold/20 text-gold border border-gold"
                  : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"
              }`}
            >
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
                <tr
                  key={guest.id}
                  className="border-b border-gold/5 hover:bg-royal/10 transition-colors"
                >
                  <td className="py-3 px-2 text-ivory">
                    {guest.firstName} {guest.lastName}
                  </td>
                  <td className="py-3 px-2 text-ivory/60">
                    {guest.email || "—"}
                  </td>
                  <td className="py-3 px-2">
                    {guest.rsvpStatus === "attending" && (
                      <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                        Attending
                      </span>
                    )}
                    {guest.rsvpStatus === "declined" && (
                      <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded">
                        Declined
                      </span>
                    )}
                    {guest.rsvpStatus === "pending" && (
                      <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-ivory/50">
                    {guest.group || "—"}
                  </td>
                  <td className="py-3 px-2 text-ivory/50">
                    {guest.plusOneAllowed
                      ? guest.plusOneName || "Allowed"
                      : "—"}
                  </td>
                  <td className="py-3 px-2 text-ivory/50">
                    {guest.tableNumber || "—"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <div className="text-center py-8 text-ivory/40">
              No guests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
