"use client";

import { useState, useRef, useEffect } from "react";

interface CalendarEvent {
  slug: string; // matches API route: ceremony | reception | rehearsal | brunch
  label: string;
  googleUrl: string;
  available: boolean;
}

interface Props {
  events: CalendarEvent[];
}

export default function AddToCalendar({ events }: Props) {
  const [open, setOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const available = events.filter((e) => e.available);
  if (available.length === 0) return null;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-outline text-sm px-5 py-2 flex items-center gap-2 no-print"
        aria-expanded={open}
      >
        <span>📅</span>
        <span>Add to Calendar</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-midnight border border-gold/20 rounded-xl shadow-xl z-10 overflow-hidden">
          {available.map((evt) => (
            <div key={evt.slug} className="border-b border-gold/10 last:border-0">
              <div className="px-4 py-2 text-xs text-ivory/40 uppercase tracking-wider font-semibold">
                {evt.label}
              </div>
              <button
                onClick={() => {
                  setActiveEvent(evt.slug);
                  window.open(evt.googleUrl, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-ivory/80 hover:bg-gold/10 hover:text-gold transition-colors text-left"
              >
                <span>🗓️</span> Google Calendar
              </button>
              <a
                href={`/api/v1/calendar/${evt.slug}`}
                onClick={() => setActiveEvent(evt.slug)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-ivory/80 hover:bg-gold/10 hover:text-gold transition-colors"
              >
                <span>🍎</span> Apple Calendar
              </a>
              <a
                href={`/api/v1/calendar/${evt.slug}`}
                onClick={() => setActiveEvent(evt.slug)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-ivory/80 hover:bg-gold/10 hover:text-gold transition-colors"
              >
                <span>📧</span> Outlook
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
