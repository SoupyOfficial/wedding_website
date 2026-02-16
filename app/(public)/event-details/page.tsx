import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Event Details",
  description:
    "Wedding ceremony and reception details.",
};

export default async function EventDetailsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  const timelineEvents = await prisma.timelineEvent.findMany({
    where: { eventType: "wedding-day" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader title="Event Details" className="mb-16" />

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
            <p className="text-ivory/60">
              {settings?.venueAddress || "Apopka, Florida"}
            </p>
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
            <p className="text-ivory/60">
              {settings?.venueAddress || "Apopka, Florida"}
            </p>
            <p className="text-gold/80 mt-4 text-sm">
              5 hours of celebration
            </p>
          </div>
        </div>

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
        {timelineEvents.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="heading-gold text-3xl text-center mb-12">
              Day-of Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gold/20" />
              {timelineEvents.map((event: { id: string; title: string; time: string | null; description: string | null }) => (
                <div key={event.id} className="flex items-start mb-8 pl-16 relative">
                  <div className="absolute left-6 top-2 w-4 h-4 bg-gold/80 rounded-full border-2 border-midnight shadow-glow" />
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
        </div>
      </div>
    </div>
  );
}
