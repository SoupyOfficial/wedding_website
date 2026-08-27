import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/services/settings.service";
import { sanitizeHtml } from "@/lib/sanitize";
import { toEasternISO, formatEasternDate } from "@/lib/timezone";
import CountdownTimer from "@/components/CountdownTimer";
import GuestWelcome from "@/components/GuestWelcome";
import HomeSections from "@/components/HomeSections";

export const metadata = {
  title: "Home",
  description:
    "Jacob & Ashley are getting married! Join us November 13, 2026 at The Highland Manor in Apopka, Florida. RSVP, event details, travel info, and more.",
};

export default async function HomePage() {
  const settings = await getSettings(
    "weddingDate", "weddingTime", "heroTagline", "heroTaglinePostWedding",
    "coupleName", "venueName", "venueAddress",
    "weddingHashtag", "postWeddingContent", "preWeddingContent",
    "rsvpDeadline", "rafflePrize"
  );

  const weddingDate = settings?.weddingDate;
  const weddingTime = settings?.weddingTime;

  let combinedDateTime: string | undefined;
  if (weddingDate) {
    try {
      const timePart = weddingTime || "16:15";
      combinedDateTime = toEasternISO(weddingDate, timePart);
    } catch {
      combinedDateTime = toEasternISO(weddingDate, "16:15");
    }
  }

  const isPostWedding = combinedDateTime
    ? new Date(combinedDateTime) < new Date()
    : false;

  // Split couple name (e.g. "Jacob & Ashley") into two parts
  const coupleName = settings?.coupleName || "Jacob & Ashley";
  const nameParts = coupleName.split(/\s*&\s*/);
  const name1 = nameParts[0]?.trim() || "Jacob";
  const name2 = nameParts[1]?.trim() || "Ashley";

  return (
    <div className="relative -mt-16 lg:-mt-20">
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
          {/* Personalized guest greeting */}
          <Suspense fallback={null}>
            <GuestWelcome />
          </Suspense>

          {/* Tagline */}
          <p className="text-ivory/70 text-lg md:text-xl tracking-widest uppercase">
            {isPostWedding
              ? settings?.heroTaglinePostWedding || "We did it! 🎉"
              : settings?.heroTagline || "Written in the stars"}
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
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                (settings?.venueAddress || "604 E Main St, Apopka, FL 32703") +
                ", " + (settings?.venueName || "The Highland Manor")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold underline underline-offset-2 transition-colors"
            >
              {settings?.venueAddress || "604 E Main St, Apopka, FL 32703"}
            </a>
          </p>

          {/* Divider */}
          <div className="gold-divider" />

          {/* Wedding Date */}
          {weddingDate && !isPostWedding && (
            <p className="text-gold font-serif text-xl md:text-2xl text-center">
              {formatEasternDate(weddingDate, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {/* Countdown or Date */}
          {combinedDateTime ? (
            <CountdownTimer
              targetDate={combinedDateTime}
              postWeddingMessage={
                settings?.heroTaglinePostWedding || "We did it! 🎉"
              }
            />
          ) : (
            <p className="text-gold/80 text-xl md:text-2xl font-serif italic">
              Date Coming Soon
            </p>
          )}

          {/* RSVP Deadline Countdown */}
          {settings?.rsvpDeadline && !isPostWedding && (() => {
            const raw = String(settings.rsvpDeadline);
            const datePart = raw.slice(0, 10);       // "YYYY-MM-DD"
            const timePart = raw.slice(11, 16) || "23:59"; // "HH:MM"
            const easternDeadline = toEasternISO(datePart, timePart);
            if (new Date(easternDeadline) > new Date()) {
              return (
                <div className="pt-2">
                  <CountdownTimer
                    targetDate={easternDeadline}
                    postWeddingMessage="RSVP deadline has passed"
                    label="Days until RSVP deadline"
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Wedding Hashtag */}
          {settings?.weddingHashtag && (
            <p className="text-gold-light text-lg font-medium tracking-wide">
              {settings.weddingHashtag}
            </p>
          )}

          {/* Pre/Post Wedding Content */}
          {isPostWedding && settings?.postWeddingContent && (
            <div
              className="text-ivory/70 leading-relaxed max-w-xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(settings.postWeddingContent.replace(/\n/g, "<br />")),
              }}
            />
          )}
          {!isPostWedding && settings?.preWeddingContent && (
            <div
              className="text-ivory/70 leading-relaxed max-w-xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(settings.preWeddingContent.replace(/\n/g, "<br />")),
              }}
            />
          )}

          {!isPostWedding && settings?.rafflePrize && (
            <p className="text-gold/70 text-sm italic">
              {settings.rafflePrize !== "-1"
                ? `Every RSVP earns one raffle entry — you could win: ${settings.rafflePrize}`
                : "Every RSVP earns one raffle entry — details coming soon!"}
            </p>
          )}
          {!isPostWedding && settings?.rafflePrize && settings.rafflePrize !== "-1" && (
            <details className="text-ivory/60 text-sm max-w-md mx-auto mt-3 group">
              <summary className="cursor-pointer text-gold/70 hover:text-gold transition-colors text-center">
                How does the raffle work? ▾
              </summary>
              <div className="mt-3 text-left space-y-2 bg-midnight-light/50 rounded-lg p-4 border border-gold/10">
                <p>Every RSVP submission automatically earns one entry. Winners will be announced during the reception — you must be present to win!</p>
                <p>Want extra chances? Additional raffle tickets will be available for purchase at the reception — all proceeds go toward our newlywed fund.</p>
                <p>Two lucky winners will each win a pair of tickets! See the <Link href="/raffle" className="text-gold underline underline-offset-2 hover:text-gold-light">Raffle page</Link> for full details.</p>
              </div>
            </details>
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

      {/* Below-fold content: schedule, quick links, story, FAQ */}
      <Suspense fallback={null}>
        <HomeSections isPostWedding={isPostWedding} />
      </Suspense>
    </div>
  );
}
