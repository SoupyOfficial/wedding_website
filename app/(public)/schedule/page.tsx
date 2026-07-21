import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { TimelineEvent } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import AddToCalendar from "@/components/AddToCalendar";
import PrintButton from "@/components/PrintButton";
import { buildCalendarEvents } from "@/lib/calendar-utils";

export const metadata = {
  title: "Schedule",
  description: "Weekend wedding schedule, venue details, ceremony timeline, and key information for our guests.",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  return timeStr;
}

export default async function SchedulePage() {
  const gate = await checkFeatureFlag("eventDetailsPageEnabled");
  if (gate) return gate;

  const settings = await getSettings(
    "weddingDate", "weddingTime", "receptionTime",
    "rehearsalDinnerDate", "rehearsalDinnerTime", "rehearsalDinnerVenue",
    "dayAfterBrunchDate", "dayAfterBrunchTime", "dayAfterBrunchVenue",
    "venueName", "venueAddress", "coupleName", "receptionVenue",
    "ceremonyType", "rsvpDeadline", "dressCode", "dressCodeImages", "parkingInfo",
    "childrenPolicy", "weatherInfo", "unpluggedCeremonyNotice"
  );

  const timelineEvents = await query<TimelineEvent>(
    "SELECT * FROM TimelineEvent WHERE eventType = ? ORDER BY sortOrder ASC",
    ["wedding-day"]
  );

  const timelineEnabled = await getFeatureFlag("timelineEnabled");

  const calendarEvents = buildCalendarEvents({
    weddingDate: settings?.weddingDate?.toString() ?? settings?.weddingDate ?? null,
    venueName: settings?.venueName,
    venueAddress: settings?.venueAddress,
    coupleName: settings?.coupleName,
    receptionVenue: settings?.receptionVenue ?? undefined,
    rehearsalDinnerDate: settings?.rehearsalDinnerDate?.toString() ?? settings?.rehearsalDinnerDate ?? null,
    rehearsalDinnerVenue: settings?.rehearsalDinnerVenue ?? undefined,
    dayAfterBrunchDate: settings?.dayAfterBrunchDate?.toString() ?? settings?.dayAfterBrunchDate ?? null,
    dayAfterBrunchVenue: settings?.dayAfterBrunchVenue ?? undefined,
  });

  // ── Weekend Events ─────────────────────────────────────────────
  const weekendEvents = [
    {
      slug: "rehearsal",
      label: "Rehearsal Dinner",
      icon: "🍽️",
      date: settings?.rehearsalDinnerDate,
      time: settings?.rehearsalDinnerTime,
      venue: settings?.rehearsalDinnerVenue || settings?.venueName || "",
      color: "border-l-gold/60",
      required: "Wedding Party",
    },
    {
      slug: "ceremony",
      label: "Ceremony",
      icon: "💒",
      date: settings?.weddingDate?.toString() ?? null,
      time: settings?.weddingTime,
      venue: settings?.venueName || "",
      color: "border-l-gold",
      required: "All Guests",
    },
    {
      slug: "reception",
      label: "Reception",
      icon: "🎉",
      date: settings?.weddingDate?.toString() ?? null,
      time: settings?.receptionTime || "Following ceremony",
      venue: settings?.venueName || "",
      color: "border-l-gold",
      required: "All Guests",
    },
    {
      slug: "brunch",
      label: "Day-After Brunch",
      icon: "🥂",
      date: settings?.dayAfterBrunchDate?.toString() ?? null,
      time: settings?.dayAfterBrunchTime,
      venue: settings?.dayAfterBrunchVenue || settings?.venueName || "",
      color: "border-l-sage",
      required: "Optional",
    },
  ].filter((e) => e.date);

  const venueLoc = `${settings?.venueName || "The Highland Manor"}, ${settings?.venueAddress || "Apopka, Florida"}`;
  const couple = settings?.coupleName || "Jacob & Ashley";

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        {/* Print-only header */}
        <div className="print-show hidden">
          <div className="print-header">
            <h1 style={{ fontSize: "24pt", fontFamily: "Georgia, serif" }}>
              {couple}
            </h1>
            {settings?.weddingDate && (
              <p style={{ fontSize: "14pt", marginTop: "0.25rem" }}>
                {formatDate(settings.weddingDate.toString())}
              </p>
            )}
            <p style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
              {venueLoc}
            </p>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-4 no-print">
          <PageHeader
            title="Schedule"
            subtitle="A complete timeline of our wedding weekend"
            className="mb-0"
          />
          <div className="flex items-center gap-3">
            <AddToCalendar events={calendarEvents} />
            <PrintButton />
          </div>
        </div>

        {/* ─── Venue Info Cards ─── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Ceremony */}
          <div className="card-celestial text-center">
            <div className="text-4xl mb-4">💒</div>
            <h2 className="heading-gold text-2xl mb-3">The Ceremony</h2>
            <p className="text-ivory/80 text-lg mb-2">
              {settings?.ceremonyType
                ? settings.ceremonyType.split("&")[0]?.trim() || "Ceremony"
                : "Outdoor Ceremony"}
            </p>
            <p className="text-ivory/60">
              {settings?.venueName || "The Highland Manor"}
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                (settings?.venueAddress || "604 E Main St, Apopka, FL 32703") +
                ", " + (settings?.venueName || "The Highland Manor")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/60 hover:text-gold underline underline-offset-2 transition-colors"
            >
              {settings?.venueAddress || "604 E Main St, Apopka, FL 32703"}
            </a>
            {settings?.weddingDate && (
              <p className="text-gold mt-4 font-serif text-lg">
                {formatDate(settings.weddingDate.toString())}
              </p>
            )}
            {settings?.weddingTime && (
              <p className="text-ivory/70">{settings.weddingTime}</p>
            )}
          </div>

          {/* Reception */}
          <div className="card-celestial text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="heading-gold text-2xl mb-3">The Reception</h2>
            <p className="text-ivory/80 text-lg mb-2">
              {settings?.ceremonyType && settings.ceremonyType.includes("&")
                ? settings.ceremonyType.split("&")[1]?.trim() || "Reception"
                : "Indoor Reception"}
            </p>
            <p className="text-ivory/60">
              {settings?.venueName || "The Highland Manor"}
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                (settings?.venueAddress || "604 E Main St, Apopka, FL 32703") +
                ", " + (settings?.venueName || "The Highland Manor")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/60 hover:text-gold underline underline-offset-2 transition-colors"
            >
              {settings?.venueAddress || "604 E Main St, Apopka, FL 32703"}
            </a>
            <p className="text-gold/80 mt-4 text-sm">
              Dinner, Dancing &amp; Celebration
            </p>
          </div>
        </div>

        {/* ─── RSVP Deadline ─── */}
        {settings?.rsvpDeadline && (
          <div className="max-w-2xl mx-auto mb-16 text-center no-print">
            <div className="card-celestial border-gold/30">
              <div className="text-3xl mb-3">💌</div>
              <h3 className="heading-gold text-xl mb-2">RSVP Deadline</h3>
              <p className="text-ivory/70">
                Please let us know by{" "}
                <span className="text-gold font-semibold">
                  {new Date(settings.rsvpDeadline).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
              <a href="/rsvp" className="btn-gold inline-block mt-4 px-6 py-2 text-sm">
                RSVP Now
              </a>
            </div>
          </div>
        )}

        {/* ─── Unplugged Ceremony Notice ─── */}
        {settings?.unpluggedCeremonyNotice && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="card-celestial border-gold/40 text-center">
              <div className="text-3xl mb-3">📵</div>
              <h3 className="heading-gold text-xl mb-2">Unplugged Ceremony</h3>
              <p className="text-ivory/70">{settings.unpluggedCeremonyNotice}</p>
            </div>
          </div>
        )}

        <SectionDivider />

        {/* ─── Weekend Overview ─── */}
        <h2 className="heading-gold text-3xl text-center mb-3">The Weekend</h2>
        <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-12">
          Here is everything happening throughout our celebration weekend
        </p>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gold/20" />
            {weekendEvents.map((event) => {
              const calEvent = calendarEvents.find((ce) => ce.slug === event.slug);
              return (
                <div
                  key={event.slug}
                  className={`relative pl-14 pb-10 last:pb-0 border-l-2 ${event.color} ml-[23px]`}
                >
                  <div className="absolute left-[-33px] top-1 w-10 h-10 rounded-full bg-midnight border-2 border-gold/40 flex items-center justify-center text-lg">
                    {event.icon}
                  </div>
                  <div className="card-celestial">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gold/70 mb-1 block">
                          {event.required}
                        </span>
                        <h3 className="heading-gold text-xl mb-1">{event.label}</h3>
                        <p className="text-ivory/70 text-sm font-medium">
                          {formatDate(event.date || null)}
                        </p>
                        {event.time && (
                          <p className="text-ivory/50 text-sm">{formatTime(event.time)}</p>
                        )}
                        {event.venue && (
                          <p className="text-ivory/40 text-xs mt-1">📍 {event.venue}</p>
                        )}
                      </div>
                      {calEvent?.available && calEvent.googleUrl && (
                        <a
                          href={calEvent.googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-xs px-3 py-1.5 shrink-0"
                        >
                          📅 Add
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Day-of Timeline ─── */}
        {timelineEnabled && timelineEvents.length > 0 && (
          <>
            <SectionDivider />
            <h2 className="heading-gold text-3xl text-center mb-3">Day-of Timeline</h2>
            <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-12">
              A detailed look at how the wedding day will unfold
            </p>

            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gold/20" />
                {timelineEvents.map((event) => (
                  <div key={event.id} className="flex items-start mb-8 pl-16 relative">
                    {event.icon ? (
                      <div className="absolute left-4 top-1 text-lg">{event.icon}</div>
                    ) : (
                      <div className="absolute left-6 top-2 w-4 h-4 bg-gold/80 rounded-full border-2 border-midnight shadow-glow" />
                    )}
                    <div className="card-celestial flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-gold font-serif text-lg font-semibold">
                          {event.title}
                        </span>
                        <span className="text-ivory/50 text-sm">{event.time}</span>
                      </div>
                      {event.description && (
                        <p className="text-ivory/60 text-sm">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <SectionDivider />

        {/* ─── Info Cards Grid (Dress Code, Parking, Accessibility, Children, Weather) ─── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Dress Code */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">👗</div>
            <h3 className="heading-gold text-xl mb-2">Dress Code</h3>
            <p className="text-ivory/70">
              {settings?.dressCode || "Formal / Semi-Formal attire"}
            </p>
            {(() => {
              if (!settings?.dressCodeImages) return null;
              try {
                const images: string[] = JSON.parse(settings.dressCodeImages);
                if (!Array.isArray(images) || images.length === 0) return null;
                return (
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Dress code example ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gold/20"
                        loading="lazy"
                      />
                    ))}
                  </div>
                );
              } catch {
                return null;
              }
            })()}
          </div>

          {/* Parking */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">🅿️</div>
            <h3 className="heading-gold text-xl mb-2">Parking</h3>
            <p className="text-ivory/70">
              {settings?.parkingInfo || "Free parking available on-site."}
            </p>
          </div>

          {/* Accessibility */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">♿</div>
            <h3 className="heading-gold text-xl mb-2">Accessibility</h3>
            <p className="text-ivory/70 text-sm">
              The venue has accessible parking near the entrance with paved,
              level paths. The ceremony and reception are on the same floor.
              Accessible restrooms are available. If you need specific
              accommodations, please let us know in your RSVP.
            </p>
          </div>

          {/* Children Policy */}
          {settings?.childrenPolicy && (
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">👶</div>
              <h3 className="heading-gold text-xl mb-2">Children</h3>
              <p className="text-ivory/70">{settings.childrenPolicy}</p>
            </div>
          )}

          {/* Weather Info */}
          {settings?.weatherInfo && (
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌤️</div>
              <h3 className="heading-gold text-xl mb-2">Weather</h3>
              <p className="text-ivory/70">{settings.weatherInfo}</p>
            </div>
          )}
        </div>

        <SectionDivider />

        {/* ─── Venue Map ─── */}
        <div className="max-w-4xl mx-auto no-print">
          <h2 className="heading-gold text-3xl text-center mb-4">
            📍 Find the Venue
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-2">
            {settings?.venueName || "The Highland Manor"} •{" "}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                (settings?.venueAddress || "604 E Main St, Apopka, FL 32703") +
                ", " + (settings?.venueName || "The Highland Manor")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
            >
              {settings?.venueAddress || "604 E Main St, Apopka, FL 32703"}
            </a>
          </p>
          <p className="text-ivory/40 text-center text-xs mb-8">
            Tap the address above for turn-by-turn directions
          </p>
          <div className="rounded-lg overflow-hidden border border-gold/20 shadow-glow">
            <iframe
              title="The Highland Manor - Venue Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.5!2d-81.4988!3d28.6715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e77611889e53b7%3A0x1feda9b7ffa63093!2sThe%20Highland%20Manor%20-%20Events%20Venue!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                "The Highland Manor, 604 E Main St, Apopka, FL 32703"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm px-5 py-2"
            >
              Get Directions
            </a>
            <a
              href="https://www.thehighlandmanor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm px-5 py-2"
            >
              Venue Website
            </a>
          </div>
        </div>

        <SectionDivider />

        {/* ─── Related Links ─── */}
        <div className="text-center max-w-xl mx-auto no-print">
          <p className="text-ivory/60 text-sm mb-6">
            Looking for more information?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/travel" className="btn-outline text-sm">
              ✈️ Travel & Stay
            </a>
            <a href="/rsvp" className="btn-gold text-sm">
              💌 RSVP Now
            </a>
            <a href="/faq" className="btn-outline text-sm">
              ❓ FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
