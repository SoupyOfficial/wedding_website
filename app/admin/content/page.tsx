"use client";

import { useState, useEffect, useCallback } from "react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  time: string | null;
  icon: string | null;
  sortOrder: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<"timeline" | "faqs">("timeline");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Timeline form
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tTime, setTTime] = useState("");
  const [tIcon, setTIcon] = useState("");

  // FAQ form
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");
  const [fCategory, setFCategory] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [timelineRes, faqRes] = await Promise.all([
        fetch("/api/v1/admin/content/timeline"),
        fetch("/api/v1/admin/content/faqs"),
      ]);
      const timelineData = await timelineRes.json();
      const faqData = await faqRes.json();
      if (timelineData.data) setTimeline(timelineData.data);
      if (faqData.data) setFaqs(faqData.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddTimeline(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/v1/admin/content/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tTitle,
          description: tDesc || undefined,
          time: tTime || undefined,
          icon: tIcon || undefined,
          sortOrder: timeline.length,
        }),
      });
      setTTitle("");
      setTDesc("");
      setTTime("");
      setTIcon("");
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteTimeline(id: string) {
    try {
      await fetch(`/api/v1/admin/content/timeline/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleAddFAQ(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/v1/admin/content/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: fQuestion,
          answer: fAnswer,
          category: fCategory || undefined,
          sortOrder: faqs.length,
        }),
      });
      setFQuestion("");
      setFAnswer("");
      setFCategory("");
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteFAQ(id: string) {
    try {
      await fetch(`/api/v1/admin/content/faqs/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gold font-serif text-3xl mb-1">Content Manager</h1>
        <p className="text-ivory/50 text-sm">Manage timeline events and FAQs</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gold/10 pb-4">
        {(["timeline", "faqs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              tab === t ? "bg-gold/20 text-gold" : "text-ivory/50 hover:text-ivory"
            }`}
          >
            {t === "timeline" ? `Timeline (${timeline.length})` : `FAQs (${faqs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <>
          {tab === "timeline" && (
            <div>
              <form onSubmit={handleAddTimeline} className="bg-royal/20 border border-gold/10 rounded-lg p-4 mb-6">
                <h3 className="text-gold font-serif text-lg mb-3">Add Event</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input type="text" value={tTitle} onChange={(e) => setTTitle(e.target.value)} className="input-celestial" placeholder="Event title" required />
                  <input type="text" value={tTime} onChange={(e) => setTTime(e.target.value)} className="input-celestial" placeholder="Time (e.g., 4:30 PM)" />
                  <input type="text" value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="input-celestial" placeholder="Description" />
                  <input type="text" value={tIcon} onChange={(e) => setTIcon(e.target.value)} className="input-celestial" placeholder="Icon emoji" />
                </div>
                <button type="submit" className="btn-gold px-4 py-2 text-sm mt-3">Add</button>
              </form>

              <div className="space-y-2">
                {timeline.map((event) => (
                  <div key={event.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{event.icon || "⏰"}</span>
                      <div>
                        <p className="text-ivory font-medium">{event.title}</p>
                        <div className="flex gap-2 text-ivory/40 text-xs">
                          {event.time && <span>{event.time}</span>}
                          {event.description && <span>• {event.description}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTimeline(event.id)} className="text-red-400/60 hover:text-red-400 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "faqs" && (
            <div>
              <form onSubmit={handleAddFAQ} className="bg-royal/20 border border-gold/10 rounded-lg p-4 mb-6">
                <h3 className="text-gold font-serif text-lg mb-3">Add FAQ</h3>
                <div className="space-y-3">
                  <input type="text" value={fQuestion} onChange={(e) => setFQuestion(e.target.value)} className="input-celestial w-full" placeholder="Question" required />
                  <textarea value={fAnswer} onChange={(e) => setFAnswer(e.target.value)} className="input-celestial w-full h-20 resize-none" placeholder="Answer" required />
                  <input type="text" value={fCategory} onChange={(e) => setFCategory(e.target.value)} className="input-celestial w-full" placeholder="Category (optional)" />
                </div>
                <button type="submit" className="btn-gold px-4 py-2 text-sm mt-3">Add</button>
              </form>

              <div className="space-y-2">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-royal/20 border border-gold/10 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-gold font-serif">{faq.question}</p>
                        <p className="text-ivory/60 text-sm mt-1">{faq.answer}</p>
                        {faq.category && <span className="text-ivory/30 text-xs mt-1 inline-block">{faq.category}</span>}
                      </div>
                      <button onClick={() => handleDeleteFAQ(faq.id)} className="text-red-400/60 hover:text-red-400 text-xs flex-shrink-0">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
