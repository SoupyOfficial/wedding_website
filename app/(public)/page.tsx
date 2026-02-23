import Link from "next/link";
import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import CountdownTimer from "@/components/CountdownTimer";

export default async function HomePage() {
  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  const weddingDate = settings?.weddingDate;
  const isPostWedding = weddingDate
    ? new Date(weddingDate) < new Date()
    : false;

  // Split couple name (e.g. "Jacob & Ashley") into two parts
  const coupleName = settings?.coupleName || "Jacob & Ashley";
  const nameParts = coupleName.split(/\s*&\s*/);
  const name1 = nameParts[0]?.trim() || "Jacob";
  const name2 = nameParts[1]?.trim() || "Ashley";

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
        {/* Moon Decoration */}
        <div className="absolute top-20 right-10 md:right-20 opacity-20">
          <svg
            className="w-24 h-24 md:w-40 md:h-40 text-gold"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.37C14.18 18.95 12 15.73 12 12s2.18-6.95 5.07-8.63A9.93 9.93 0 0 0 12 2z" />
          </svg>
        </div>

        <div className="animate-fade-in-up space-y-8 max-w-3xl">
          {/* Tagline */}
          <p className="text-ivory/70 text-lg md:text-xl tracking-widest uppercase">
            {isPostWedding
              ? settings?.heroTaglinePostWedding || "We did it! 🎉"
              : settings?.heroTagline || "We're getting married!"}
          </p>

          {/* Couple Names */}
          <h1 className="text-gold font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-shadow-glow leading-tight">
            {name1}
            <span className="block text-3xl md:text-4xl lg:text-5xl text-ivory/80 font-normal my-2">
              &
            </span>
            {name2}
          </h1>

          {/* Venue */}
          <p className="text-ivory/60 text-base md:text-lg">
            {settings?.venueName || "The Highland Manor"} •{" "}
            {settings?.venueAddress || "Apopka, Florida"}
          </p>

          {/* Divider */}
          <div className="gold-divider" />

          {/* Countdown or Date */}
          {weddingDate ? (
            <CountdownTimer
              targetDate={weddingDate}
              postWeddingMessage={
                settings?.heroTaglinePostWedding || "We did it! 🎉"
              }
            />
          ) : (
            <p className="text-gold/80 text-xl md:text-2xl font-serif italic">
              Date Coming Soon
            </p>
          )}

          {/* Wedding Hashtag */}
          {settings?.weddingHashtag && (
            <p className="text-gold-light text-lg font-medium tracking-wide">
              {settings.weddingHashtag}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {!isPostWedding && (
              <Link href="/rsvp" className="btn-gold text-lg">
                RSVP Now
              </Link>
            )}
            <Link href="/our-story" className="btn-outline text-lg">
              Our Story
            </Link>
            {isPostWedding && (
              <Link href="/gallery" className="btn-gold text-lg">
                View Photos
              </Link>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-float">
          <svg
            className="w-6 h-6 text-gold/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
