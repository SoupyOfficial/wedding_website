"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminCommunicationsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/messages");
      const data = await res.json();
      if (data.data) setMessages(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Toggle Read/Unread ────────────────────────
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
        if (selected?.id === msg.id) {
          setSelected({ ...msg, isRead: newIsRead });
        }
      }
    } catch { /* silently fail */ }
  }

  // ── Mark as Read on Select ────────────────────
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

  // ── Delete ────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/v1/admin/messages/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch { /* silently fail */ }
  }

  // ── Filtering ─────────────────────────────────
  const unreadCount = messages.filter((m) => !m.isRead).length;
  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Communications</h1>
        <p className="text-ivory/50 text-sm">
          {messages.length} messages · {unreadCount} unread
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              filter === f
                ? "bg-gold/20 text-gold border border-gold"
                : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1 bg-gold text-midnight px-1.5 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Message List */}
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
              <div className="text-center py-8 text-ivory/40">No messages.</div>
            )}
          </div>

          {/* Message Detail */}
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
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
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
