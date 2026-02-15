"use client";

import { useState, useEffect } from "react";

interface GuestBookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export default function GuestBookPage() {
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/v1/guestbook");
      const data = await res.json();
      if (data.data) {
        setEntries(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign the guest book.");
        return;
      }

      setSuccess(true);
      setName("");
      setMessage("");
      // Refresh entries
      fetchEntries();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Sign a Star
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Leave us a message and add your star to our constellation of love
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Sign Form */}
          <div>
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl mb-6">
                Leave Your Message
              </h2>

              {success && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-300 text-sm">
                  ✨ Your star has been added! It will appear once approved.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-celestial w-full h-32 resize-none"
                    placeholder="Share your well wishes, advice, or a favorite memory..."
                    required
                    maxLength={500}
                  />
                  <p className="text-ivory/30 text-xs mt-1 text-right">
                    {message.length}/500
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !message.trim()}
                  className="btn-gold w-full py-3 disabled:opacity-50"
                >
                  {submitting ? "Adding your star..." : "⭐ Sign a Star"}
                </button>
              </form>
            </div>
          </div>

          {/* Entries Display */}
          <div>
            <h2 className="text-gold font-serif text-2xl mb-6">
              Our Constellation
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-gold/50">
                  Loading messages...
                </div>
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="card-celestial border-gold/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-1">⭐</span>
                      <div>
                        <p className="text-ivory/80 text-sm leading-relaxed mb-2">
                          &ldquo;{entry.message}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 text-xs text-ivory/40">
                          <span className="text-gold/70 font-serif">
                            — {entry.name}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-celestial text-center py-8">
                <div className="text-4xl mb-3">🌟</div>
                <p className="text-ivory/50">
                  Be the first to sign a star!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
