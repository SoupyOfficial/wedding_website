"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/ui";

type SearchResult = {
  id: number;
  songName: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl: string;
  previewUrl: string;
};

type VisibleSong = {
  id: string;
  songTitle: string;
  artist: string;
  artworkUrl: string | null;
  guestName: string;
};

export default function MusicPage() {
  // ── Search state ──────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ── Request form state ────────────────────────
  const [guestName, setGuestName] = useState("");
  const [manualSong, setManualSong] = useState("");
  const [manualArtist, setManualArtist] = useState("");
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Visible playlist ──────────────────────────
  const [visibleSongs, setVisibleSongs] = useState<VisibleSong[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);

  // ── Audio preview ─────────────────────────────
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Fetch the couple's visible playlist ───────
  useEffect(() => {
    fetch("/api/v1/music/requests")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVisibleSongs(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingPlaylist(false));
  }, []);

  // ── iTunes search with debounce ───────────────
  const doSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/v1/music/search?q=${encodeURIComponent(query)}&limit=6`
      );
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setSelectedSong(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(value), 350);
  };

  // ── Select a search result ────────────────────
  const selectResult = (result: SearchResult) => {
    setSelectedSong(result);
    setSearchQuery("");
    setSearchResults([]);
    setManualSong("");
    setManualArtist("");
  };

  const clearSelection = () => {
    setSelectedSong(null);
    setSearchQuery("");
  };

  // ── Preview audio ─────────────────────────────
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

  // ── Submit request ────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    const name = guestName.trim();
    if (!name) {
      setSubmitMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    const songTitle = selectedSong ? selectedSong.songName : manualSong.trim();
    const artist = selectedSong ? selectedSong.artist : manualArtist.trim();

    if (!songTitle) {
      setSubmitMessage({
        type: "error",
        text: "Please search for a song or type one in manually.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/music/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          songTitle,
          artist,
          artworkUrl: selectedSong?.artworkUrl || null,
          previewUrl: selectedSong?.previewUrl || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSubmitMessage({
          type: "success",
          text: "🎶 Song request submitted! The couple will review it.",
        });
        setSelectedSong(null);
        setManualSong("");
        setManualArtist("");
        setSearchQuery("");
      } else {
        setSubmitMessage({
          type: "error",
          text: data.error || "Something went wrong.",
        });
      }
    } catch {
      setSubmitMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cleanup audio on unmount ──────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Music & Song Requests"
          subtitle="Help us build the perfect playlist for our celebration! Search for your favorite songs and submit a request."
          className="mb-16"
        />

        <div className="max-w-4xl mx-auto space-y-16">
          {/* ── Song Request Form ─────────────────── */}
          <section>
            <div className="text-center mb-8">
              <h2 className="heading-gold text-3xl mb-3">🎵 Request a Song</h2>
              <p className="text-ivory/60 max-w-lg mx-auto">
                Search Apple Music to find the perfect track, or type in a song
                manually. We&apos;ll do our best to play your favorites!
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="card-celestial max-w-xl mx-auto space-y-5"
            >
              {/* Guest Name */}
              <div>
                <label className="block text-ivory/70 text-sm mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="input-celestial w-full"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Apple Music Search */}
              <div>
                <label className="block text-ivory/70 text-sm mb-1.5">
                  Search for a Song
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="input-celestial w-full pl-10"
                    placeholder="Search songs, artists, albums..."
                    autoComplete="off"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30">
                    🔍
                  </span>
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedSong && (
                <div className="bg-midnight/50 border border-gold/10 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-royal/30 cursor-pointer transition-colors border-b border-gold/5 last:border-0"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0"
                        onClick={() => selectResult(result)}
                      >
                        {result.artworkUrl && (
                          <img
                            src={result.artworkUrl}
                            alt=""
                            className="w-12 h-12 rounded-md object-cover shrink-0 shadow-md"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-ivory font-medium text-sm truncate">
                            {result.songName}
                          </div>
                          <div className="text-ivory/50 text-xs truncate">
                            {result.artist} · {result.album}
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
                          className="text-gold/60 hover:text-gold transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10"
                          title="Preview"
                        >
                          {playingPreview === result.previewUrl ? "⏸" : "▶️"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Song Card */}
              {selectedSong && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {selectedSong.artworkUrl && (
                      <img
                        src={selectedSong.artworkUrl}
                        alt=""
                        className="w-14 h-14 rounded-md object-cover shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-ivory font-medium truncate">
                        {selectedSong.songName}
                      </div>
                      <div className="text-ivory/50 text-sm truncate">
                        {selectedSong.artist}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-ivory/40 hover:text-red-400 text-sm transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Entry (if no search result selected) */}
              {!selectedSong && (
                <div className="border-t border-gold/10 pt-4">
                  <p className="text-ivory/40 text-xs text-center mb-3">
                    — or type it in manually —
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-ivory/70 text-sm mb-1">
                        Song Title
                      </label>
                      <input
                        type="text"
                        value={manualSong}
                        onChange={(e) => setManualSong(e.target.value)}
                        className="input-celestial w-full"
                        placeholder="Song title"
                      />
                    </div>
                    <div>
                      <label className="block text-ivory/70 text-sm mb-1">
                        Artist
                      </label>
                      <input
                        type="text"
                        value={manualArtist}
                        onChange={(e) => setManualArtist(e.target.value)}
                        className="input-celestial w-full"
                        placeholder="Artist name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Message */}
              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === "success"
                      ? "bg-green-900/20 border border-green-500/30 text-green-300"
                      : "bg-red-900/20 border border-red-500/30 text-red-300"
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full py-3 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-midnight/40 border-t-midnight rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "🎶 Submit Song Request"
                )}
              </button>
            </form>
          </section>

          {/* ── Our Playlist (Visible Songs) ─────── */}
          <section>
            <div className="text-center mb-8">
              <h2 className="heading-gold text-3xl mb-3">🎧 Our Playlist</h2>
              <p className="text-ivory/60 max-w-lg mx-auto">
                Songs we&apos;ve selected for the celebration. Keep checking
                back — we&apos;re always adding more!
              </p>
            </div>

            {loadingPlaylist ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              </div>
            ) : visibleSongs.length === 0 ? (
              <div className="text-center py-12 card-celestial max-w-md mx-auto">
                <div className="text-4xl mb-3">🎵</div>
                <p className="text-ivory/50">
                  Our playlist is coming soon! Submit a request and maybe your
                  song will show up here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 max-w-xl mx-auto">
                {visibleSongs.map((song, i) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 bg-royal/20 border border-gold/10 rounded-lg p-4 hover:border-gold/30 transition-colors group"
                  >
                    <span className="text-gold/30 font-mono text-sm w-6 text-right shrink-0">
                      {i + 1}.
                    </span>
                    {song.artworkUrl ? (
                      <img
                        src={song.artworkUrl}
                        alt=""
                        className="w-11 h-11 rounded-md object-cover shadow-md shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-md bg-royal/50 border border-gold/20 flex items-center justify-center text-lg shrink-0">
                        🎵
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-ivory font-medium truncate">
                        {song.songTitle}
                      </div>
                      <div className="text-ivory/50 text-sm truncate">
                        {song.artist || "Unknown Artist"}
                        {song.guestName && (
                          <span className="text-ivory/30">
                            {" "}
                            · Requested by {song.guestName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── DJ Note ──────────────────────────── */}
          <section className="text-center">
            <div className="card-celestial max-w-lg mx-auto">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="text-gold font-serif text-xl mb-2">
                A Note from the DJ
              </h3>
              <p className="text-ivory/60 text-sm leading-relaxed">
                We&apos;ll do our best to play as many requests as possible!
                While we can&apos;t guarantee every song will make the cut, your
                suggestions help shape the vibe of the night. Keep the requests
                coming!
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
