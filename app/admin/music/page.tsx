"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  playTime: string;
};

type SearchResult = {
  id: number;
  songName: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl: string;
  previewUrl: string;
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
  const [djForm, setDJForm] = useState({ songName: "", artist: "", listType: "must-play", playTime: "" });

  // iTunes search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Apple Music import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importListType, setImportListType] = useState("must-play");
  const [importPlayTime, setImportPlayTime] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    playlistName: string;
    totalTracks: number;
    addedCount: number;
    skippedCount: number;
  } | null>(null);
  const [importError, setImportError] = useState("");
  const [appleMusicConfigured, setAppleMusicConfigured] = useState<boolean | null>(null);

  // Filters
  const [requestFilter, setRequestFilter] = useState<"all" | "approved" | "pending">("all");
  const [djFilter, setDJFilter] = useState<"all" | "must-play" | "do-not-play">("all");

  // Audio preview
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Check Apple Music configuration on mount
  useEffect(() => {
    fetch("/api/v1/admin/music/apple-music/import?check=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAppleMusicConfigured(data.data.configured);
      })
      .catch(() => setAppleMusicConfigured(false));
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── iTunes Search ─────────────────────────────
  const searchItunes = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/v1/admin/music/apple-music/search?q=${encodeURIComponent(query)}&limit=8`
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        setShowSearchResults(true);
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchItunes(value), 300);
  };

  const selectSearchResult = (result: SearchResult) => {
    setDJForm({ ...djForm, songName: result.songName, artist: result.artist });
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const togglePreview = (url: string) => {
    if (playingPreview === url) {
      audioRef.current?.pause();
      setPlayingPreview(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.volume = 0.3;
      audio.play();
      audio.onended = () => setPlayingPreview(null);
      audioRef.current = audio;
      setPlayingPreview(url);
    }
  };

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
      setDJForm({ songName: item.songName, artist: item.artist, listType: item.listType, playTime: item.playTime || "" });
    } else {
      setEditingDJ(null);
      setDJForm({ songName: "", artist: "", listType: "must-play", playTime: "" });
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
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

  // ── Apple Music Import ────────────────────────
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);

    try {
      const res = await fetch("/api/v1/admin/music/apple-music/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: importUrl.trim(),
          listType: importListType,
          playTime: importPlayTime,
          skipDuplicates,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setImportError(data.error || "Import failed.");
        return;
      }

      setImportResult(data.data);
      // Refresh the DJ list
      const djRes = await fetch("/api/v1/admin/music/dj-list");
      const djData = await djRes.json();
      if (djData.success) setDJItems(djData.data);
    } catch {
      setImportError("Something went wrong. Please try again.");
    } finally {
      setImporting(false);
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl text-gold">Music Management</h1>
        {activeTab === "dj" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setImportUrl("");
                setImportResult(null);
                setImportError("");
                setShowImportModal(true);
              }}
              className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
            >
              <span>🍎</span> Import from Apple Music
            </button>
            <button onClick={() => openDJModal()} className="btn-gold text-sm px-4 py-2">
              + Add Song
            </button>
          </div>
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
              No DJ list items. Add songs or import from Apple Music.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gold/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-royal/30 text-gold/80 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Song</th>
                    <th className="px-4 py-3">Artist</th>
                    <th className="px-4 py-3">When to Play</th>
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
                        {d.playTime ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                            {d.playTime}
                          </span>
                        ) : (
                          <span className="text-ivory/30 text-xs">—</span>
                        )}
                      </td>
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

      {/* ─── DJ ITEM MODAL (with iTunes Search) ─── */}
      {showDJModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl text-gold">
              {editingDJ ? "Edit DJ List Item" : "Add Song to DJ List"}
            </h2>

            {/* iTunes Search */}
            {!editingDJ && (
              <div ref={searchRef} className="relative">
                <label className="block text-ivory/70 text-sm mb-1">
                  Search Apple Music
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    className="input-celestial w-full pr-8"
                    placeholder="Search songs, artists..."
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-midnight border border-gold/20 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-royal/30 cursor-pointer transition-colors border-b border-gold/5 last:border-0"
                      >
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => selectSearchResult(result)}
                        >
                          <div className="flex items-center gap-2">
                            {result.artworkUrl && (
                              <img
                                src={result.artworkUrl}
                                alt=""
                                className="w-10 h-10 rounded object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-ivory text-sm font-medium truncate">
                                {result.songName}
                              </div>
                              <div className="text-ivory/50 text-xs truncate">
                                {result.artist} · {result.album}
                              </div>
                            </div>
                          </div>
                        </div>
                        {result.previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePreview(result.previewUrl);
                            }}
                            className="text-gold/60 hover:text-gold text-lg shrink-0 w-8 h-8 flex items-center justify-center"
                            title="Preview"
                          >
                            {playingPreview === result.previewUrl ? "⏸" : "▶"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gold/10 pt-3">
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

              <div className="mt-3">
                <label className="block text-ivory/70 text-sm mb-1">Artist</label>
                <input
                  type="text"
                  value={djForm.artist}
                  onChange={(e) => setDJForm({ ...djForm, artist: e.target.value })}
                  className="input-celestial w-full"
                  placeholder="Artist name"
                />
              </div>

              <div className="mt-3">
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

              <div className="mt-3">
                <label className="block text-ivory/70 text-sm mb-1">When to Play</label>
                <select
                  value={djForm.playTime}
                  onChange={(e) => setDJForm({ ...djForm, playTime: e.target.value })}
                  className="input-celestial w-full"
                >
                  <option value="">Anytime</option>
                  <option value="Ceremony">Ceremony</option>
                  <option value="Cocktail Hour">Cocktail Hour</option>
                  <option value="Dinner">Dinner</option>
                  <option value="First Dance">First Dance</option>
                  <option value="Father-Daughter Dance">Father-Daughter Dance</option>
                  <option value="Mother-Son Dance">Mother-Son Dance</option>
                  <option value="Cake Cutting">Cake Cutting</option>
                  <option value="Bouquet Toss">Bouquet Toss</option>
                  <option value="Garter Toss">Garter Toss</option>
                  <option value="Party">Party</option>
                  <option value="Last Dance">Last Dance</option>
                  <option value="Send Off">Send Off</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveDJItem} className="btn-gold flex-1 py-2">
                {editingDJ ? "Save Changes" : "Add Song"}
              </button>
              <button
                onClick={() => {
                  setShowDJModal(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setPlayingPreview(null);
                  }
                }}
                className="btn-outline flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── APPLE MUSIC IMPORT MODAL ─────────────── */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-midnight border border-gold/20 rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-gold flex items-center gap-2">
                <span>🍎</span> Import from Apple Music
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-ivory/40 hover:text-ivory text-xl"
              >
                ×
              </button>
            </div>

            {appleMusicConfigured === false ? (
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm font-medium mb-2">
                  Apple Music API Not Configured
                </p>
                <p className="text-ivory/60 text-xs leading-relaxed">
                  To import playlists, add these environment variables:
                </p>
                <ul className="text-ivory/50 text-xs mt-2 space-y-1 font-mono">
                  <li>APPLE_MUSIC_TEAM_ID</li>
                  <li>APPLE_MUSIC_KEY_ID</li>
                  <li>APPLE_MUSIC_PRIVATE_KEY</li>
                </ul>
                <p className="text-ivory/50 text-xs mt-3">
                  Generate a MusicKit key in the{" "}
                  <a
                    href="https://developer.apple.com/account/resources/authkeys/list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline"
                  >
                    Apple Developer Portal
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                {!importResult ? (
                  <>
                    <p className="text-ivory/60 text-sm">
                      Paste an Apple Music playlist URL to import all tracks into your DJ list.
                    </p>

                    <div>
                      <label className="block text-ivory/70 text-sm mb-1">
                        Playlist URL *
                      </label>
                      <input
                        type="url"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="input-celestial w-full"
                        placeholder="https://music.apple.com/us/playlist/my-playlist/pl.xxxx"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-ivory/70 text-sm mb-1">
                          Add as
                        </label>
                        <select
                          value={importListType}
                          onChange={(e) => setImportListType(e.target.value)}
                          className="input-celestial w-full"
                        >
                          <option value="must-play">Must Play</option>
                          <option value="do-not-play">Do Not Play</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-ivory/70 text-sm mb-1">
                          When to Play
                        </label>
                        <select
                          value={importPlayTime}
                          onChange={(e) => setImportPlayTime(e.target.value)}
                          className="input-celestial w-full"
                        >
                          <option value="">Anytime</option>
                          <option value="Ceremony">Ceremony</option>
                          <option value="Cocktail Hour">Cocktail Hour</option>
                          <option value="Dinner">Dinner</option>
                          <option value="First Dance">First Dance</option>
                          <option value="Father-Daughter Dance">Father-Daughter Dance</option>
                          <option value="Mother-Son Dance">Mother-Son Dance</option>
                          <option value="Cake Cutting">Cake Cutting</option>
                          <option value="Bouquet Toss">Bouquet Toss</option>
                          <option value="Garter Toss">Garter Toss</option>
                          <option value="Party">Party</option>
                          <option value="Last Dance">Last Dance</option>
                          <option value="Send Off">Send Off</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-ivory/70 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skipDuplicates}
                          onChange={(e) => setSkipDuplicates(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Skip duplicates
                      </label>
                    </div>

                    {importError && (
                      <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        {importError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleImport}
                        disabled={importing || !importUrl.trim()}
                        className="btn-gold flex-1 py-2 disabled:opacity-50"
                      >
                        {importing ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-midnight/40 border-t-midnight rounded-full animate-spin" />
                            Importing...
                          </span>
                        ) : (
                          "Import Playlist"
                        )}
                      </button>
                      <button
                        onClick={() => setShowImportModal(false)}
                        className="btn-outline flex-1 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  /* Import Success */
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🎉</div>
                      <p className="text-green-300 font-medium">
                        Imported &ldquo;{importResult.playlistName}&rdquo;
                      </p>
                      <div className="flex justify-center gap-6 mt-3 text-sm">
                        <div>
                          <span className="text-green-300 font-bold text-lg">
                            {importResult.addedCount}
                          </span>
                          <p className="text-ivory/50 text-xs">Added</p>
                        </div>
                        <div>
                          <span className="text-amber-300 font-bold text-lg">
                            {importResult.skippedCount}
                          </span>
                          <p className="text-ivory/50 text-xs">Skipped</p>
                        </div>
                        <div>
                          <span className="text-ivory/70 font-bold text-lg">
                            {importResult.totalTracks}
                          </span>
                          <p className="text-ivory/50 text-xs">Total</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setImportResult(null);
                          setImportUrl("");
                        }}
                        className="btn-outline flex-1 py-2"
                      >
                        Import Another
                      </button>
                      <button
                        onClick={() => setShowImportModal(false)}
                        className="btn-gold flex-1 py-2"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
