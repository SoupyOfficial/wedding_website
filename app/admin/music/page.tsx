"use client";

import { useState, useEffect, useCallback } from "react";

type SongRequest = {
  id: string;
  guestName: string;
  songTitle: string;
  artist: string;
  approved: boolean;
  createdAt: string;
};

type DJListItem = {
  id: string;
  songName: string;
  artist: string;
  listType: string;
};

type Tab = "requests" | "playlist" | "dj";

export default function AdminMusicPage() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [djItems, setDJItems] = useState<DJListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // DJ list form
  const [showDJModal, setShowDJModal] = useState(false);
  const [editingDJ, setEditingDJ] = useState<DJListItem | null>(null);
  const [djForm, setDJForm] = useState({ songName: "", artist: "", listType: "must-play" });

  // Filters
  const [requestFilter, setRequestFilter] = useState<"all" | "approved" | "pending">("all");
  const [djFilter, setDJFilter] = useState<"all" | "must-play" | "do-not-play">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, djRes] = await Promise.all([
        fetch("/api/v1/admin/music/requests"),
        fetch("/api/v1/admin/music/dj-list"),
      ]);
      const reqData = await reqRes.json();
      const djData = await djRes.json();
      if (reqData.success) setRequests(reqData.data);
      if (djData.success) setDJItems(djData.data);
    } catch (err) {
      console.error("Failed to fetch music data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Song Request Actions ──────────────────────
  const toggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/music/requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved: !currentApproved } : r))
        );
      }
    } catch (err) {
      console.error("Failed to toggle approval", err);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Delete this song request?")) return;
    try {
      const res = await fetch(`/api/v1/admin/music/requests/${id}`, { method: "DELETE" });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete request", err);
    }
  };

  // ── DJ List Actions ───────────────────────────
  const openDJModal = (item?: DJListItem) => {
    if (item) {
      setEditingDJ(item);
      setDJForm({ songName: item.songName, artist: item.artist, listType: item.listType });
    } else {
      setEditingDJ(null);
      setDJForm({ songName: "", artist: "", listType: "must-play" });
    }
    setShowDJModal(true);
  };

  const saveDJItem = async () => {
    if (!djForm.songName.trim()) return;
    try {
      if (editingDJ) {
        const res = await fetch(`/api/v1/admin/music/dj-list/${editingDJ.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(djForm),
        });
        const data = await res.json();
        if (data.success) {
          setDJItems((prev) => prev.map((d) => (d.id === editingDJ.id ? data.data : d)));
        }
      } else {
        const res = await fetch("/api/v1/admin/music/dj-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(djForm),
        });
        const data = await res.json();
        if (data.success) setDJItems((prev) => [...prev, data.data]);
      }
      setShowDJModal(false);
    } catch (err) {
      console.error("Failed to save DJ item", err);
    }
  };

  const deleteDJItem = async (id: string) => {
    if (!confirm("Delete this DJ list item?")) return;
    try {
      const res = await fetch(`/api/v1/admin/music/dj-list/${id}`, { method: "DELETE" });
      if (res.ok) setDJItems((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete DJ item", err);
    }
  };

  // ── Filtering ─────────────────────────────────
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === "approved") return r.approved;
    if (requestFilter === "pending") return !r.approved;
    return true;
  });

  const approvedRequests = requests.filter((r) => r.approved);

  const filteredDJ = djItems.filter((d) => {
    if (djFilter === "all") return true;
    return d.listType === djFilter;
  });

  // ── Tab counts ────────────────────────────────
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "requests", label: "Song Requests", count: requests.length },
    { key: "playlist", label: "Approved Playlist", count: approvedRequests.length },
    { key: "dj", label: "DJ List", count: djItems.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-ivory/60 text-lg">Loading music data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-gold">Music Management</h1>
        {activeTab === "dj" && (
          <button onClick={() => openDJModal()} className="btn-gold text-sm px-4 py-2">
            + Add DJ List Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gold/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t
              ${activeTab === tab.key
                ? "bg-royal/30 text-gold border-b-2 border-gold"
                : "text-ivory/60 hover:text-ivory hover:bg-royal/10"
              }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-royal/40 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── REQUESTS TAB ─────────────────────────── */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["all", "pending", "approved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRequestFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors
                  ${requestFilter === f
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-royal/20 text-ivory/60 border border-gold/10 hover:text-ivory"
                  }`}
              >
                {f === "all" ? "All" : f === "pending" ? "Pending" : "Approved"}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-ivory/40">No song requests yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gold/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-royal/30 text-gold/80 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Song</th>
                    <th className="px-4 py-3">Artist</th>
                    <th className="px-4 py-3">Requested By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-royal/10 transition-colors">
                      <td className="px-4 py-3 text-ivory font-medium">{r.songTitle}</td>
                      <td className="px-4 py-3 text-ivory/70">{r.artist || "—"}</td>
                      <td className="px-4 py-3 text-ivory/70">{r.guestName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            r.approved
                              ? "bg-green-500/20 text-green-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {r.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => toggleApproval(r.id, r.approved)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            r.approved
                              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                              : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                          }`}
                        >
                          {r.approved ? "Unapprove" : "Approve"}
                        </button>
                        <button
                          onClick={() => deleteRequest(r.id)}
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
        </div>
      )}

      {/* ─── APPROVED PLAYLIST TAB ────────────────── */}
      {activeTab === "playlist" && (
        <div className="space-y-4">
          {approvedRequests.length === 0 ? (
            <div className="text-center py-12 text-ivory/40">
              No approved songs yet. Approve requests from the Song Requests tab.
            </div>
          ) : (
            <div className="grid gap-3">
              {approvedRequests.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 bg-royal/20 border border-gold/10 rounded-lg p-4"
                >
                  <span className="text-gold/40 font-mono text-sm w-8 text-right">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-ivory font-medium truncate">{r.songTitle}</div>
                    <div className="text-ivory/50 text-sm truncate">
                      {r.artist || "Unknown Artist"} · Requested by {r.guestName}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApproval(r.id, true)}
                    className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── DJ LIST TAB ──────────────────────────── */}
      {activeTab === "dj" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["all", "must-play", "do-not-play"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDJFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors
                  ${djFilter === f
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-royal/20 text-ivory/60 border border-gold/10 hover:text-ivory"
                  }`}
              >
                {f === "all" ? "All" : f === "must-play" ? "Must Play" : "Do Not Play"}
              </button>
            ))}
          </div>

          {filteredDJ.length === 0 ? (
            <div className="text-center py-12 text-ivory/40">
              No DJ list items. Add songs above.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gold/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-royal/30 text-gold/80 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Song</th>
                    <th className="px-4 py-3">Artist</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {filteredDJ.map((d) => (
                    <tr key={d.id} className="hover:bg-royal/10 transition-colors">
                      <td className="px-4 py-3 text-ivory font-medium">{d.songName}</td>
                      <td className="px-4 py-3 text-ivory/70">{d.artist || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            d.listType === "must-play"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {d.listType === "must-play" ? "Must Play" : "Do Not Play"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openDJModal(d)}
                          className="text-xs px-2 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDJItem(d.id)}
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
        </div>
      )}

      {/* ─── DJ ITEM MODAL ────────────────────────── */}
      {showDJModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl text-gold">
              {editingDJ ? "Edit DJ List Item" : "Add DJ List Item"}
            </h2>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Song Name *</label>
              <input
                type="text"
                value={djForm.songName}
                onChange={(e) => setDJForm({ ...djForm, songName: e.target.value })}
                className="input-celestial w-full"
                placeholder="Song name"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Artist</label>
              <input
                type="text"
                value={djForm.artist}
                onChange={(e) => setDJForm({ ...djForm, artist: e.target.value })}
                className="input-celestial w-full"
                placeholder="Artist name"
              />
            </div>

            <div>
              <label className="block text-ivory/70 text-sm mb-1">Category</label>
              <select
                value={djForm.listType}
                onChange={(e) => setDJForm({ ...djForm, listType: e.target.value })}
                className="input-celestial w-full"
              >
                <option value="must-play">Must Play</option>
                <option value="do-not-play">Do Not Play</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveDJItem} className="btn-gold flex-1 py-2">
                {editingDJ ? "Save Changes" : "Add Song"}
              </button>
              <button
                onClick={() => setShowDJModal(false)}
                className="btn-outline flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
