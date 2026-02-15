"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-royal to-midnight flex items-center justify-center px-4">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-lg">
        {/* Moon */}
        <div className="mx-auto mb-8 w-32 h-32 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center shadow-lg shadow-gold/20">
          <span className="text-6xl">🌙</span>
        </div>

        <h1 className="font-display text-6xl text-gold mb-4">404</h1>
        <h2 className="font-display text-2xl text-ivory mb-4">
          Lost Among the Stars
        </h2>
        <p className="text-ivory/70 mb-8 leading-relaxed">
          It seems you&apos;ve wandered off the celestial path. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-gold">
            Return Home
          </Link>
          <Link
            href="/rsvp"
            className="btn-outline"
          >
            RSVP
          </Link>
        </div>
      </div>
    </div>
  );
}
