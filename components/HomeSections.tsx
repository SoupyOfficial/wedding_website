import Link from "next/link";
import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import { getFeatureFlags } from "@/lib/config/feature-flags";
import SectionDivider from "@/components/SectionDivider";
import type { FAQ } from "@/lib/db-types";

interface HomeSectionsProps {
  isPostWedding: boolean;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  return timeStr;
}

export default async function HomeSections({ isPostWedding }: HomeSectionsProps) {
  const [settings, featureFlags, faqs] = await Promise.all([
    getSettings(
      "weddingDate", "weddingTime", "receptionTime",
      "rehearsalDinnerDate", "rehearsalDinnerTime", "rehearsalDinnerVenue",
      "dayAfterBrunchDate", "dayAfterBrunchTime", "dayAfterBrunchVenue",
      "venueName", "coupleName"
    ),
    getFeatureFlags(),
    query<FAQ>(
      "SELECT * FROM FAQ WHERE isVisible = 1 ORDER BY sortOrder ASC LIMIT 3"
    ),
  ]);

  const coupleName = settings?.coupleName || "Jacob & Ashley";

  // Build schedule events
  const scheduleEvents: Array<{
    icon: string;
    label: string;
    date: string;
    time: string;
    venue: string;
  }> = [];

  // Rehearsal Dinner
  if (settings?.rehearsalDinnerDate) {
    scheduleEvents.push({
      icon: "🍽️",
      label: "Rehearsal Dinner",
      date: formatDate(settings.rehearsalDinnerDate),
      time: formatTime(settings.rehearsalDinnerTime),
      venue: settings.rehearsalDinnerVenue || settings.venueName || "",
    });
  }

  // Wedding Ceremony
  if (settings?.weddingDate) {
    scheduleEvents.push({
      icon: "💒",
      label: "Ceremony",
      date: formatDate(settings.weddingDate),
      time: formatTime(settings.weddingTime),
      venue: settings.venueName || "",
    });
  }

  // Wedding Reception
  if (settings?.weddingDate) {
    scheduleEvents.push({
      icon: "🎉",
      label: "Reception",
      date: formatDate(settings.weddingDate),
      time: formatTime(settings.receptionTime) || "Following ceremony",
      venue: settings.venueName || "",
    });
  }

  // Day-After Brunch
  if (settings?.dayAfterBrunchDate) {
    scheduleEvents.push({
      icon: "🥂",
      label: "Day-After Brunch",
      date: formatDate(settings.dayAfterBrunchDate),
      time: formatTime(settings.dayAfterBrunchTime),
      venue: settings.dayAfterBrunchVenue || settings.venueName || "",
    });
  }

  // Build quick-link tiles
  const quickLinks: Array<{
    icon: string;
    label: string;
    href: string;
    desc: string;
    flag: string;
  }> = [
    {
      icon: "📅",
      label: "Schedule",
      href: "/schedule",
      desc: "Weekend timeline, venue & details",
      flag: "eventDetailsPageEnabled",
    },
    {
      icon: "✈️",
      label: "Travel & Stay",
      href: "/travel",
      desc: "Hotels, airports & things to do",
      flag: "travelPageEnabled",
    },
    {
      icon: "💒",
      label: "Wedding Party",
      href: "/wedding-party",
      desc: "Meet the bridal party",
      flag: "weddingPartyPageEnabled",
    },
    {
      icon: "🎵",
      label: "Song Requests",
      href: "/music",
      desc: "Request a song for the DJ",
      flag: "musicPageEnabled",
    },
    {
      icon: "📸",
      label: "Gallery",
      href: "/gallery",
      desc: "Photos from the celebration",
      flag: "galleryPageEnabled",
    },
    {
      icon: "❓",
      label: "FAQ",
      href: "/faq",
      desc: "Common questions answered",
      flag: "faqPageEnabled",
    },
  ];

  const visibleLinks = quickLinks.filter(
    (link) => (featureFlags as Record<string, boolean>)[link.flag] !== false
  );

  return (
    <>
      {/* Post-Wedding Mode: Thank You */}
      {isPostWedding ? (
        <>
          <SectionDivider />
          <section className="section-padding text-center">
            <h2 className="heading-gold text-3xl md:text-4xl mb-6">
              Thank You!
            </h2>
            <p className="text-ivory/70 text-lg max-w-2xl mx-auto mb-8">
              Thank you to everyone who celebrated with us! We are so grateful for
              your love and support on our special day.
            </p>
            <Link href="/gallery" className="btn-gold inline-block">
              View Wedding Photos
            </Link>
          </section>
        </>
      ) : (
        <>
          {/* Section 1: Weekend Schedule */}
          {scheduleEvents.length > 0 && (
            <>
              <SectionDivider />
              <section className="section-padding">
                <h2 className="heading-gold text-3xl md:text-4xl text-center mb-3">
                  The Weekend
                </h2>
                <p className="text-ivory/60 text-center max-w-xl mx-auto mb-10">
                  Here&apos;s what we have planned for our celebration weekend
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
                  {scheduleEvents.map((event) => (
                    <div
                      key={event.label}
                      className="card-celestial text-center hover:border-gold/40 transition-all duration-300"
                    >
                      <div className="text-3xl mb-3">{event.icon}</div>
                      <h3 className="text-gold font-serif text-lg mb-2">
                        {event.label}
                      </h3>
                      <p className="text-ivory/70 text-sm font-medium">
                        {event.date}
                      </p>
                      {event.time && (
                        <p className="text-ivory/50 text-sm">{event.time}</p>
                      )}
                      {event.venue && (
                        <p className="text-ivory/40 text-xs mt-1">{event.venue}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href="/schedule"
                    className="text-gold hover:text-gold-light underline underline-offset-4 text-sm font-medium transition-colors"
                  >
                    View Full Schedule →
                  </Link>
                </div>
              </section>
            </>
          )}

          {/* Section 2: Quick Links */}
          <SectionDivider />
          <section className="section-padding">
            <h2 className="heading-gold text-3xl md:text-4xl text-center mb-3">
              Explore
            </h2>
            <p className="text-ivory/60 text-center max-w-xl mx-auto mb-10">
              Everything you need to know for the big day
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card-celestial group hover:border-gold/40 hover:shadow-glow transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="text-gold font-serif text-lg mb-1 group-hover:text-gold-light transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-ivory/50 text-sm">{link.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Section 3: Our Story Preview */}
          {featureFlags.ourStoryPageEnabled !== false && (
            <>
              <SectionDivider />
              <section className="section-padding text-center">
                <h2 className="heading-gold text-3xl md:text-4xl mb-6">
                  Our Story
                </h2>
                <p className="text-ivory/60 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  Every love story is beautiful, but ours is our favorite. From
                  the moment we met, we knew something special was beginning.
                  We can&apos;t wait to start this next chapter together —
                  surrounded by the people we love most.
                </p>
                <Link
                  href="/our-story"
                  className="btn-outline inline-block"
                >
                  Read Our Full Story
                </Link>
              </section>
            </>
          )}

          {/* Section 4: FAQ Preview */}
          {featureFlags.faqPageEnabled !== false && faqs.length > 0 && (
            <>
              <SectionDivider />
              <section className="section-padding">
                <h2 className="heading-gold text-3xl md:text-4xl text-center mb-3">
                  Common Questions
                </h2>
                <p className="text-ivory/60 text-center max-w-xl mx-auto mb-10">
                  Quick answers to what guests ask most
                </p>

                <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
                  {faqs.slice(0, 3).map((faq) => (
                    <div key={faq.id} className="card-celestial">
                      <h3 className="text-gold font-serif text-base mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-ivory/60 text-sm line-clamp-3">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href="/faq"
                    className="text-gold hover:text-gold-light underline underline-offset-4 text-sm font-medium transition-colors"
                  >
                    View All FAQs →
                  </Link>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {/* Final gold divider to separate from footer */}
      <SectionDivider />
    </>
  );
}
