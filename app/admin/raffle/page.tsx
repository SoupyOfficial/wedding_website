"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader, LoadingState, EmptyState, Alert } from "@/components/ui";

interface RaffleEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  rsvpSubmittedAt: string | null;
}

function formatRsvpTime(rsvpSubmittedAt: string | null) {
  if (!rsvpSubmittedAt) return "—";
  return new Date(rsvpSubmittedAt).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminRafflePage() {
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/raffle/entries");
      const data = await res.json();
      if (data.success) setEntries(data.data);
      else setError(data.error || "Failed to load raffle entries.");
    } catch {
      setError("Failed to load raffle entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function copyList() {
    const text = entries
      .map(
        (entry, i) =>
          `${i + 1}. ${entry.firstName} ${entry.lastName}${entry.email ? ` (${entry.email})` : ""}`
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently fail */
    }
  }

  if (loading) return <LoadingState message="Loading raffle entries..." />;

  return (
    <div>
      <AdminPageHeader
        title="Raffle"
        subtitle="2 winners × 1 pair Universal tickets — drawn live at the reception. You must be present to win."
        actions={
          entries.length > 0 ? (
            <button onClick={copyList} className="btn-gold px-4 py-2 text-sm">
              {copied ? "Copied!" : "Copy list"}
            </button>
          ) : undefined
        }
      />

      <p className="text-ivory/40 text-xs italic mb-4">
        Entries are ordered by RSVP submission time. Extra tickets purchased at the reception are tracked on paper.
      </p>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {entries.length === 0 ? (
        <EmptyState
          title="No eligible entries yet. Guests are entered automatically when they RSVP."
        />
      ) : (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <p className="text-gold font-serif text-lg mb-3">
            {entries.length} eligible {entries.length !== 1 ? "entries" : "entry"}
          </p>
          <div className="divide-y divide-gold/10">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 py-3 border-b border-gold/10"
              >
                <span className="text-gold font-serif w-8 flex-shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ivory font-medium">
                    {entry.firstName} {entry.lastName}
                  </p>
                  <p className="text-ivory/40 text-xs">
                    {entry.email || "—"}
                  </p>
                </div>
                <span className="text-ivory/40 text-xs flex-shrink-0">
                  RSVP&apos;d {formatRsvpTime(entry.rsvpSubmittedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
