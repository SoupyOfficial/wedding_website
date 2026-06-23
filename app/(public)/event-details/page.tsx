import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { TimelineEvent } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import { getFeatureFlag } from "@/lib/config/feature-flags";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import PrintButton from "@/components/PrintButton";
import AddToCalendar from "@/components/AddToCalendar";

export const metadata = {
  title: "Event Details",
  description:
    "Wedding ceremony and reception details.",
};

export default async function EventDetailsPage() {
  const gate = await checkFeatureFlag("eventDetailsPageEnabled");
  if (gate) return gate;
  const settings = await getSettings(
    "ceremonyType", "venueName", "venueAddress", "weddingDate",
    "weddingTime", "rsvpDeadline", "dressCode", "parkingInfo",
    "childrenPolicy", "weatherInfo", "coupleName",
    "receptionTime", "receptionVenue",
    "rehearsalDinnerDate", "rehearsalDinnerTime", "rehearsalDinnerVenue",
    "dayAfterBrunchDate", "dayAfterBrunchTime", "dayAfterBrunchVenue"
  );

  // Build Google Calendar URL helper
  function gcalUrl(title: string, start: string, end: string, location: string, details: string) {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    return `${base}&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
  }

  function toGcalDate(d: Date) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const weddingBase = settings?.weddingDate ? new Date(settings.weddingDate) : null;
  const venueLoc = `${settings?.venueName || "The Highland Manor"}, ${settings?.venueAddress || "Apopka, Florida"}`;
  const couple = settings?.coupleName || "Jacob & Ashley";

  const calendarEvents = [
    {
      slug: "ceremony",
      label: "Wedding Ceremony",
      available: !!weddingBase,
      googleUrl: weddingBase
        ? gcalUrl(`${couple} — Wedding Ceremony`, toGcalDate(weddingBase), toGcalDate(new Date(weddingBase.getTime() + 90 * 60 * 1000)), venueLoc, `Wedding ceremony of ${couple}`)
        : "",
    },
    {
      slug: "reception",
      label: "Wedding Reception",
      available: !!weddingBase,
      googleUrl: weddingBase
        ? gcalUrl(`${couple} — Wedding Reception`, toGcalDate(new Date(weddingBase.getTime() + 120 * 60 * 1000)), toGcalDate(new Date(weddingBase.getTime() + 6 * 60 * 60 * 1000)), settings?.receptionVenue ? `${settings.receptionVenue}` : venueLoc, `Reception for ${couple}`)
        : "",
    },
    {
      slug: "rehearsal",
      label: "Rehearsal Dinner",
      available: !!settings?.rehearsalDinnerDate,
      googleUrl: settings?.rehearsalDinnerDate
        ? gcalUrl(`${couple} — Rehearsal Dinner`, toGcalDate(new Date(settings.rehearsalDinnerDate)), toGcalDate(new Date(new Date(settings.rehearsalDinnerDate).getTime() + 2 * 60 * 60 * 1000)), settings?.rehearsalDinnerVenue || venueLoc, `Rehearsal dinner for ${couple}`)
        : "",
    },
    {
      slug: "brunch",
      label: "Day-After Brunch",
      available: !!settings?.dayAfterBrunchDate,
      googleUrl: settings?.dayAfterBrunchDate
        ? gcalUrl(`${couple} — Day-After Brunch`, toGcalDate(new Date(settings.dayAfterBrunchDate)), toGcalDate(new Date(new Date(settings.dayAfterBrunchDate).getTime() + 2 * 60 * 60 * 1000)), settings?.dayAfterBrunchVenue || venueLoc, `Day-after brunch with ${couple}`)
        : "",
    },
  ];

  const timelineEvents = await query<TimelineEvent>(
    "SELECT * FROM TimelineEvent WHERE eventType = ? ORDER BY sortOrder ASC",
    ["wedding-day"]
  );

  const timelineEnabled = await getFeatureFlag("timelineEnabled");

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        {/* Print-only header */}
        <div className="print-header print-show hidden">
          <h1 style={{ fontSize: "24pt", fontFamily: "Georgia, serif" }}>
            {settings?.coupleName || "Jacob & Ashley"}
          </h1>
          {settings?.weddingDate && (
            <p style={{ fontSize: "14pt", marginTop: "0.25rem" }}>
              {new Date(settings.weddingDate).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          )}
          <p style={{ fontSize: "12pt", marginTop: "0.25rem" }}>
            {settings?.venueName || "The Highland Manor"} — {settings?.venueAddress || "Apopka, Florida"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-4 no-print">
          <PageHeader title="Event Details" className="mb-0" />
          <div className="flex items-center gap-3">
            <AddToCalendar events={calendarEvents} />
            <PrintButton />
          </div>
        </div>

        {/* Venue Info */}
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
                {new Date(settings.weddingDate).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
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

        {/* RSVP Deadline */}
        {settings?.rsvpDeadline && (
          <div className="max-w-2xl mx-auto mb-16 text-center">
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

        {/* Unplugged Ceremony Notice */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="card-celestial border-gold/40 text-center">
            <div className="text-3xl mb-3">📵</div>
            <h3 className="heading-gold text-xl mb-2">
              Unplugged Ceremony
            </h3>
            <p className="text-ivory/70">
              We kindly ask that you put away phones and cameras during the
              ceremony. Our professional photographer will capture every
              moment, and we&apos;ll share the photos with you afterward!
            </p>
          </div>
        </div>

        <SectionDivider />

        {/* Day-of Timeline */}
        {timelineEnabled && timelineEvents.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="heading-gold text-3xl text-center mb-12">
              Day-of Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gold/20" />
              {timelineEvents.map((event: { id: string; title: string; time: string | null; description: string | null; icon: string | null }) => (
                <div key={event.id} className="flex items-start mb-8 pl-16 relative">
                  {event.icon ? (
                    <div className="absolute left-4 top-1 text-lg">{event.icon}</div>
                  ) : (
                    <div className="absolute left-6 top-2 w-4 h-4 bg-gold/80 rounded-full border-2 border-midnight shadow-glow" />
                  )}
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-gold font-serif text-lg font-semibold">
                        {event.title}
                      </span>
                      <span className="text-ivory/50 text-sm">
                        {event.time}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-ivory/60 text-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <SectionDivider />

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Dress Code */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">👗</div>
            <h3 className="heading-gold text-xl mb-2">Dress Code</h3>
            <p className="text-ivory/70">
              {settings?.dressCode || "Formal / Semi-Formal attire"}
            </p>
          </div>

          {/* Parking */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">🅿️</div>
            <h3 className="heading-gold text-xl mb-2">Parking</h3>
            <p className="text-ivory/70">
              {settings?.parkingInfo ||
                "Free parking available on-site."}
            </p>
          </div>

          {/* Children Policy */}
          {settings?.childrenPolicy && (
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">👶</div>
              <h3 className="heading-gold text-xl mb-2">Children</h3>
              <p className="text-ivory/70">
                {settings.childrenPolicy}
              </p>
            </div>
          )}

          {/* Weather Info */}
          {settings?.weatherInfo && (
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌤️</div>
              <h3 className="heading-gold text-xl mb-2">Weather</h3>
              <p className="text-ivory/70">
                {settings.weatherInfo}
              </p>
            </div>
          )}
        </div>

        <SectionDivider />

        {/* Venue Map */}
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
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.5!2d-81.4988!3d28.6715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e77611889e53b7%3A0x1feda9b7ffa63093!2sThe%20Highland%20Manor%20-%20Events%20Venue!5e0!3m2!1sen!2sus!4v1`}
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
      </div>
    </div>
  );
}
