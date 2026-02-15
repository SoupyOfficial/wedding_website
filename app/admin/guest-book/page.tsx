"use client";

import { useState, useEffect, useCallback } from "react";

interface GuestBookEntry {
  id: string;
  name: string;
  message: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminGuestBookPage() {
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/guest-book");
      const data = await res.json();
      if (data.data) setEntries(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/v1/admin/guest-book/${id}/approve`, { method: "POST" });
      fetchEntries();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`/api/v1/admin/guest-book/${id}`, { method: "DELETE" });
      fetchEntries();
    } catch {
      // silently fail
    }
  }

  const filtered = entries.filter((e) => {
    if (filter === "pending") return !e.isVisible;
    if (filter === "approved") return e.isVisible;
    return true;
  });

  const pendingCount = entries.filter((e) => !e.isVisible).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Guest Book</h1>
        <p className="text-ivory/50 text-sm">
          {entries.length} entries • {pendingCount} pending approval
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
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
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1 bg-gold text-midnight px-1.5 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`bg-royal/20 border rounded-lg p-4 ${
                entry.isVisible ? "border-gold/10" : "border-yellow-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-ivory/80 text-sm mb-2">
                    &ldquo;{entry.message}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ivory/40">
                    <span className="text-gold/70">— {entry.name}</span>
                    <span>•</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    {!entry.isVisible && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!entry.isVisible && (
                    <button
                      onClick={() => handleApprove(entry.id)}
                      className="text-green-400 hover:text-green-300 text-xs bg-green-900/30 px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-400 hover:text-red-300 text-xs bg-red-900/30 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-ivory/40">
          No entries found.
        </div>
      )}
    </div>
  );
}
