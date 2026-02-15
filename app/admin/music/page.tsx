"use client";

import { useState, useEffect, useCallback } from "react";

interface SongRequest {
  id: string;
  songTitle: string;
  artist: string;
  guestName: string;
  approved: boolean;
  createdAt: string;
}

interface DJItem {
  id: string;
  songName: string;
  artist: string;
  listType: string;
}

export default function AdminMusicPage() {
  const [songs, setSongs] = useState<SongRequest[]>([]);
  const [djList, setDjList] = useState<DJItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"requests" | "playlist" | "dj">("requests");

  // Add song form
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newCategory, setNewCategory] = useState("must-play");

  const fetchData = useCallback(async () => {
    try {
      const [songsRes, djRes] = await Promise.all([
        fetch("/api/v1/admin/music/requests"),
        fetch("/api/v1/admin/music/dj-list"),
      ]);
      const songsData = await songsRes.json();
      const djData = await djRes.json();
      if (songsData.data) setSongs(songsData.data);
      if (djData.data) setDjList(djData.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApproveSong(id: string) {
    try {
      await fetch(`/api/v1/admin/music/requests/${id}/approve`, {
        method: "POST",
      });
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteSong(id: string) {
    try {
      await fetch(`/api/v1/admin/music/requests/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleAddDJ(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/v1/admin/music/dj-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songName: newTitle,
          artist: newArtist || undefined,
          listType: newCategory,
        }),
      });
      setNewTitle("");
      setNewArtist("");
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteDJ(id: string) {
    try {
      await fetch(`/api/v1/admin/music/dj-list/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Music & DJ</h1>
        <p className="text-ivory/50 text-sm">
          Manage song requests and DJ playlist
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gold/10 pb-4">
        {(["requests", "playlist", "dj"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              tab === t
                ? "bg-gold/20 text-gold"
                : "text-ivory/50 hover:text-ivory"
            }`}
          >
            {t === "requests" && `Guest Requests (${songs.length})`}
            {t === "playlist" && "Approved Playlist"}
            {t === "dj" && `DJ List (${djList.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <>
          {/* Guest Song Requests */}
          {tab === "requests" && (
            <div className="space-y-2">
              {songs.length > 0 ? (
                songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4"
                  >
                    <div>
                      <p className="text-ivory font-medium">{song.songTitle}</p>
                      {song.artist && (
                        <p className="text-ivory/50 text-sm">{song.artist}</p>
                      )}
                      {song.guestName && (
                        <p className="text-ivory/30 text-xs mt-1">
                          Requested by {song.guestName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!song.approved && (
                        <button
                          onClick={() => handleApproveSong(song.id)}
                          className="text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="text-red-400 hover:text-red-300 text-xs bg-red-900/30 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-ivory/40">
                  No song requests yet.
                </div>
              )}
            </div>
          )}

          {/* Approved Playlist */}
          {tab === "playlist" && (
            <div className="space-y-2">
              {songs.filter((s) => s.approved).length > 0 ? (
                songs
                  .filter((s) => s.approved)
                  .map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 bg-royal/20 border border-gold/10 rounded-lg p-4"
                    >
                      <span className="text-xl">🎵</span>
                      <div>
                        <p className="text-ivory">{song.songTitle}</p>
                        {song.artist && (
                          <p className="text-ivory/50 text-sm">{song.artist}</p>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-ivory/40">
                  No approved songs yet.
                </div>
              )}
            </div>
          )}

          {/* DJ List */}
          {tab === "dj" && (
            <div>
              {/* Add to DJ List */}
              <form
                onSubmit={handleAddDJ}
                className="flex gap-2 mb-6 flex-wrap"
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-celestial flex-1 min-w-[150px]"
                  placeholder="Song title"
                  required
                />
                <input
                  type="text"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="input-celestial flex-1 min-w-[150px]"
                  placeholder="Artist"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-celestial"
                >
                  <option value="must-play">Must Play</option>
                  <option value="do-not-play">Do Not Play</option>
                  <option value="if-possible">If Possible</option>
                </select>
                <button type="submit" className="btn-gold px-4 py-2 text-sm">
                  Add
                </button>
              </form>

              {/* DJ List Items */}
              {(["must-play", "do-not-play", "if-possible"] as const).map(
                (category) => {
                  const items = djList.filter((d) => d.listType === category);
                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="mb-6">
                      <h3
                        className={`text-sm font-medium mb-2 ${
                          category === "must-play"
                            ? "text-green-400"
                            : category === "do-not-play"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {category
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-3"
                          >
                            <div>
                              <span className="text-ivory text-sm">
                                {item.songName}
                              </span>
                              {item.artist && (
                                <span className="text-ivory/40 text-sm">
                                  {" "}
                                  — {item.artist}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteDJ(item.id)}
                              className="text-red-400/60 hover:text-red-400 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
