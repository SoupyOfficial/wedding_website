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

export default function AdminCommunicationsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/messages");
      const data = await res.json();
      if (data.data) setMessages(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/v1/admin/messages/${id}/read`, { method: "POST" });
      fetchMessages();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/v1/admin/messages/${id}`, { method: "DELETE" });
      setSelected(null);
      fetchMessages();
    } catch {
      // silently fail
    }
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Communications</h1>
        <p className="text-ivory/50 text-sm">
          {messages.length} messages • {unreadCount} unread
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg);
                    if (!msg.isRead) handleMarkRead(msg.id);
                  }}
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
                    <span className="text-ivory text-sm font-medium truncate">
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
              <div className="text-center py-8 text-ivory/40">
                No messages.
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-gold font-serif text-xl">
                      {selected.subject}
                    </h3>
                    <p className="text-ivory/50 text-sm mt-1">
                      From: {selected.name} ({selected.email})
                    </p>
                    <p className="text-ivory/30 text-xs mt-1">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-red-400/60 hover:text-red-400 text-xs bg-red-900/30 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
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
