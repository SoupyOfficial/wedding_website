"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, FilterBar, LoadingState, EmptyState, ConfirmButton } from "@/components/ui";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type Filter = "all" | "unread" | "read";

const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "unread" as const, label: "Unread" },
  { value: "read" as const, label: "Read" },
];

function RsvpReminderPanel() {
  const [sending, setSending] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [result, setResult] = useState<{ sent?: number; skipped?: number; errors?: string[]; scheduled?: boolean; targetCount?: number } | null>(null);

  async function handleSend(schedule = false) {
    setSending(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {};
      if (schedule && scheduledAt) body.scheduledAt = scheduledAt;
      const res = await fetch("/api/v1/admin/guests/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ errors: ["Network error"] });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-gold font-serif text-lg font-bold">RSVP Reminder Emails</h2>
          <p className="text-ivory/50 text-sm mt-1">
            Send a reminder to all guests who haven&apos;t responded yet (excluding declined). Personalized invite links included when available.
          </p>
        </div>
        <span className="text-2xl flex-shrink-0">📧</span>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <button
          onClick={() => handleSend(false)}
          disabled={sending}
          className="btn-gold text-sm px-4 py-2 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send Now"}
        </button>

        <div className="flex gap-2 items-center">
          <label className="text-ivory/60 text-sm">Schedule for:</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-midnight border border-gold/20 text-ivory text-sm rounded px-3 py-1.5 focus:outline-none focus:border-gold/50"
          />
          <button
            onClick={() => handleSend(true)}
            disabled={sending || !scheduledAt}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-50"
          >
            Schedule
          </button>
        </div>
      </div>

      {result && (
        <div className={`mt-4 p-3 rounded text-sm ${result.errors?.length ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-green-500/10 border border-green-500/20 text-green-300"}`}>
          {result.scheduled ? (
            <span>✅ Scheduled to send to {result.targetCount} guest{result.targetCount !== 1 ? "s" : ""}.</span>
          ) : (
            <span>
              ✅ Sent to {result.sent} guest{result.sent !== 1 ? "s" : ""}.
              {(result.skipped ?? 0) > 0 && ` ${result.skipped} skipped (no email).`}
              {result.errors && result.errors.length > 0 && (
                <span className="text-red-300"> {result.errors.length} failed.</span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCommunicationsPage() {
  const { data: messages, loading, setData: setMessages } = useAdminFetch<ContactMessage>("/api/v1/admin/messages");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  async function toggleRead(msg: ContactMessage) {
    const newIsRead = !msg.isRead;
    try {
      const res = await fetch(`/api/v1/admin/messages/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newIsRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: newIsRead } : m))
        );
        if (selected?.id === msg.id) setSelected({ ...msg, isRead: newIsRead });
      }
    } catch { /* silently fail */ }
  }

  async function selectMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.isRead) {
      try {
        const res = await fetch(`/api/v1/admin/messages/${msg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
          );
          setSelected({ ...msg, isRead: true });
        }
      } catch { /* silently fail */ }
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/v1/admin/messages/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch { /* silently fail */ }
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  return (
    <div>
      <AdminPageHeader
        title="Communications"
        subtitle={`${messages.length} messages · ${unreadCount} unread`}
      />

      <RsvpReminderPanel />

      <h2 className="text-gold font-serif text-lg font-bold mb-4">Contact Messages</h2>

      <div className="mb-6">
        <FilterBar filters={FILTERS} active={filter} onChange={setFilter} variant="button" />
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => selectMessage(msg)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === msg.id
                      ? "bg-gold/10 border-gold/30"
                      : msg.isRead
                        ? "bg-royal/10 border-gold/5 hover:border-gold/20"
                        : "bg-royal/20 border-gold/20 hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isRead && (
                      <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-sm truncate ${msg.isRead ? "text-ivory/70" : "text-ivory font-medium"}`}>
                      {msg.name}
                    </span>
                  </div>
                  <p className="text-ivory/50 text-xs truncate">{msg.subject}</p>
                  <p className="text-ivory/30 text-xs mt-1">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            ) : (
              <EmptyState title="No messages" />
            )}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="min-w-0">
                    <h3 className="text-gold font-serif text-xl">{selected.subject}</h3>
                    <p className="text-ivory/50 text-sm mt-1">
                      From: {selected.name} ({selected.email})
                    </p>
                    <p className="text-ivory/30 text-xs mt-1">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleRead(selected)}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        selected.isRead
                          ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      }`}
                    >
                      {selected.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                    <ConfirmButton
                      onConfirm={() => handleDelete(selected.id)}
                      message="Delete this message?"
                      className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </ConfirmButton>
                  </div>
                </div>
                <div className="border-t border-gold/10 pt-4">
                  <p className="text-ivory/80 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
                <div className="border-t border-gold/10 pt-4 mt-4">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                    className="btn-gold inline-block text-sm px-4 py-2"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-royal/10 border border-gold/5 rounded-lg p-12 text-center">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-ivory/40">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
