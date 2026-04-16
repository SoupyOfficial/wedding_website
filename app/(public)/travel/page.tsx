import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Hotel, TimelineEvent } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import WeatherForecast from "@/components/WeatherForecast";
import {
  airports,
  groundTransport,
  railAndDriving,
  DEFAULT_PARKING_INFO,
  featuredPark,
  themeParks,
  restaurants,
  localActivities,
  trafficTips,
} from "@/lib/config/travel-content";
import TravelTimeChecker from "@/components/TravelTimeChecker";

export const metadata = {
  title: "Travel & Stay",
  description: "Hotels, travel information, and things to do near the wedding venue.",
};

export default async function TravelPage() {
  const gate = await checkFeatureFlag("travelPageEnabled");
  if (gate) return gate;
  const settings = await getSettings("raffleTicketCount", "parkingInfo", "weddingDate", "travelContent");

  const hotels = await query<Hotel>("SELECT * FROM Hotel ORDER BY sortOrder ASC");

  const timelineEvents = await query<TimelineEvent>(
    "SELECT * FROM TimelineEvent WHERE eventType = ? ORDER BY sortOrder ASC",
    ["wedding-day"]
  );

  const raffleTicketCount = settings?.raffleTicketCount ?? 2;
  const parkingInfo = settings?.parkingInfo || DEFAULT_PARKING_INFO;

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Travel & Stay"
          subtitle="Everything you need to know about getting here, where to stay, and what to explore"
          className="mb-16"
        />

        {/* Hotels */}
        <div className="mb-16">
          <h2 className="heading-gold text-3xl text-center mb-4">
            Where to Stay
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
            We&apos;ve arranged room blocks at nearby hotels for your convenience.
            Book early to secure the best rates — Orlando is a popular destination!
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="card-celestial text-center">
                <div className="text-3xl mb-3">🏨</div>
                <h3 className="text-gold font-serif text-xl mb-2">
                  {hotel.name}
                </h3>
                {hotel.priceRange && (
                  <p className="text-gold/70 text-xs font-semibold uppercase tracking-wider mb-2">
                    {hotel.priceRange}
                  </p>
                )}
                {hotel.address && (
                  <p className="text-ivory/60 text-sm mb-1">
                    📍 {hotel.address}
                  </p>
                )}
                {hotel.distanceFromVenue && (
                  <p className="text-ivory/50 text-xs mb-2">
                    🚗 {hotel.distanceFromVenue} from venue
                  </p>
                )}
                {hotel.phone && (
                  <p className="text-ivory/50 text-xs mb-2">
                    📞 {hotel.phone}
                  </p>
                )}
                {hotel.blockCode && (
                  <p className="text-gold/80 text-sm mb-1">
                    Block Code: <span className="font-mono font-bold">{hotel.blockCode}</span>
                  </p>
                )}
                {hotel.blockDeadline && (
                  <p className="text-ivory/50 text-xs mb-2">
                    ⏰ Book by:{" "}
                    {new Date(hotel.blockDeadline).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {hotel.amenities && (
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    {hotel.amenities.split(",").map((amenity: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-royal/40 text-ivory/60 px-2 py-0.5 rounded-full"
                      >
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {hotel.notes && (
                  <p className="text-ivory/60 text-sm mb-3">
                    {hotel.notes}
                  </p>
                )}
                <div className="flex gap-2 justify-center mt-4">
                  {hotel.bookingLink && (
                    <a
                      href={hotel.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-sm px-4 py-2"
                    >
                      Book Now
                    </a>
                  )}
                  {hotel.website && (
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm px-4 py-2"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hotels.length > 0 && (
            <p className="text-center text-ivory/40 text-xs mt-4 italic">
              Rates and availability are subject to change. We recommend booking as soon as possible.
            </p>
          )}
        </div>

        <SectionDivider />

        {/* Getting There */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="heading-gold text-3xl text-center mb-4">
            Getting There
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
            Central Florida is well-connected by air, rail, and road. Here are your best options for getting to the venue.
          </p>

          {/* Airports */}
          <div className="mb-8">
            <h3 className="text-gold font-serif text-xl text-center mb-4">✈️ Airports</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {airports.map((airport) => (
                <div key={airport.code} className="card-celestial">
                  <h4 className="text-gold font-serif text-lg mb-2">{airport.name}</h4>
                  <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
                    {airport.subtitle}
                  </p>
                  <ul className="text-ivory/70 space-y-1.5 text-sm">
                    {airport.details.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Ground Transportation */}
          <div className="mb-8">
            <h3 className="text-gold font-serif text-xl text-center mb-4">🚗 Ground Transportation</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {groundTransport.map((opt) => (
                <div key={opt.name} className="card-celestial">
                  <h4 className="text-gold font-serif text-lg mb-2">{opt.name}</h4>
                  <p className="text-ivory/70 text-sm mb-2">{opt.description}</p>
                  <ul className="text-ivory/60 space-y-1 text-sm">
                    {opt.details.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Rail & Driving */}
          <div>
            <h3 className="text-gold font-serif text-xl text-center mb-4">🚄 Rail & Driving</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {railAndDriving.map((opt) => (
                <div key={opt.name} className="card-celestial">
                  <h4 className="text-gold font-serif text-lg mb-2">{opt.name}</h4>
                  <p className="text-ivory/70 text-sm mb-2">{opt.description}</p>
                  <ul className="text-ivory/60 space-y-1 text-sm">
                    {opt.details.map((d, i) => (
                      <li key={i}>• {d.replace("{{parkingInfo}}", parkingInfo)}</li>
                    ))}
                  </ul>
                  {opt.name === "Brightline High-Speed Rail" && (
                    <p className="text-ivory/60 space-y-1 text-sm mt-1">
                      • Book at <span className="text-gold/80">gobrightline.com</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* Orlando Traffic Tips */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="heading-gold text-3xl text-center mb-4">
            🚦 Orlando Traffic Tips
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
            Orlando traffic can be unpredictable — especially around the
            tourist corridors. The venue is in Apopka, northwest of Orlando
            proper, so local driving is easy. The challenge is getting <em>to</em>{" "}
            Apopka on the highways. <span className="text-gold">Think in travel
            time, not miles.</span>
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {trafficTips.map((tip) => (
              <div key={tip.title} className="card-celestial">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{tip.icon}</span>
                  <div>
                    <h3 className="text-gold font-serif text-base mb-1">
                      {tip.title}
                    </h3>
                    <p className="text-ivory/60 text-sm leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* Travel Time Checker */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="heading-gold text-3xl text-center mb-4">
            📍 Check Your Travel Time
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
            Enter your hotel, Airbnb, or starting address below to see estimated
            driving time to the venue — or tap a popular location for a quick check.
          </p>
          <TravelTimeChecker />
        </div>

        <SectionDivider />

        {/* Live Weather Forecast */}
        <WeatherForecast
          weddingDate={settings?.weddingDate ?? null}
          timelineEvents={timelineEvents.map((e) => ({
            id: e.id,
            title: e.title,
            time: e.time,
            icon: e.icon ?? undefined,
            sortOrder: e.sortOrder,
          }))}
        />

        <SectionDivider />

        {/* Things to Do — Theme Parks */}
        <div className="max-w-5xl mx-auto">
          <h2 className="heading-gold text-3xl text-center mb-4">
            Things to Do in the Area
          </h2>
          <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
            Orlando is the theme park capital of the world! If you&apos;re extending your trip, there&apos;s no shortage of amazing experiences nearby.
          </p>

          {/* Universal — Featured */}
          <div className="mb-8">
            <div className="card-celestial border-gold/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-bl-lg">
                ⭐ FEATURED
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="text-4xl mb-3">{featuredPark.icon}</div>
                  <h3 className="text-gold font-serif text-2xl mb-2">
                    {featuredPark.name}
                  </h3>
                  <p className="text-ivory/70 text-sm mb-4">
                    {featuredPark.description}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    {featuredPark.subParks.map((sp) => (
                      <div key={sp.name} className="bg-royal/30 rounded-lg p-3 text-center">
                        <p className="text-gold font-serif text-sm font-bold">{sp.name}</p>
                        <p className="text-ivory/50 text-xs mt-1">{sp.description}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="text-ivory/60 space-y-1 text-sm mb-4">
                    {featuredPark.details.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {raffleTicketCount > 0 && (
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center mt-2">
                  <p className="text-gold font-serif text-lg mb-1">🎟️ Universal Ticket Raffle!</p>
                  <p className="text-ivory/70 text-sm">
                    We&apos;ll be raffling off{" "}
                    <span className="text-gold font-bold">
                      {raffleTicketCount === 1
                        ? "one Universal theme park ticket"
                        : `${raffleTicketCount} Universal theme park tickets`}
                    </span>{" "}
                    at the reception! All guests in attendance are eligible to win.
                  </p>
                  <p className="text-ivory/40 text-xs mt-2 italic">
                    Subject to availability. Details will be announced at the reception.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Other Theme Parks */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {themeParks.map((park) => (
              <div key={park.name} className="card-celestial text-center">
                <div className="text-3xl mb-3">{park.icon}</div>
                <h3 className="text-gold font-serif text-lg mb-2">{park.name}</h3>
                <p className="text-ivory/60 text-sm mb-2">{park.distance}</p>
                <p className="text-ivory/50 text-xs">{park.description}</p>
              </div>
            ))}
          </div>

          {/* Dining Near the Venue */}
          <div className="mb-10">
            <h3 className="text-gold font-serif text-xl text-center mb-2">🍽️ Dining Near the Venue</h3>
            <p className="text-ivory/50 text-center text-sm mb-6">
              Apopka and the surrounding area have a variety of great restaurants — perfect for pre-wedding dinners, day-after brunch, or a casual bite.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((r) => (
                <div key={r.name} className="card-celestial">
                  <h4 className="text-gold font-serif text-base mb-1">{r.icon} {r.name}</h4>
                  <p className="text-ivory/50 text-xs mb-1">{r.meta}</p>
                  <p className="text-ivory/60 text-xs">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Local Activities */}
          <div className="mb-8">
            <h3 className="text-gold font-serif text-xl text-center mb-2">🌴 More Local Activities</h3>
            <p className="text-ivory/50 text-center text-sm mb-6">
              Looking for something beyond the parks? Central Florida has plenty to offer.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localActivities.map((a) => (
                <div key={a.name} className="card-celestial text-center">
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <h4 className="text-gold font-serif text-base mb-1">{a.name}</h4>
                  <p className="text-ivory/50 text-xs">{a.description}</p>
                </div>
              ))}
            </div>
          </div>

          {raffleTicketCount > 0 && (
            <div className="text-center bg-royal/20 border border-gold/20 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-gold font-serif text-xl mb-2">🎉 Don&apos;t Forget!</p>
              <p className="text-ivory/70 text-sm">
                We&apos;ll be giving away{" "}
                <span className="text-gold font-bold">
                  {raffleTicketCount === 1
                    ? "a Universal theme park ticket"
                    : `${raffleTicketCount} Universal theme park tickets`}
                </span>{" "}
                at the reception via raffle. Make sure you&apos;re there for your chance to win!
              </p>
              <p className="text-ivory/40 text-xs mt-2 italic">
                Subject to availability. Winners must be present.
              </p>
            </div>
          )}
        </div>

        {/* Additional Travel Content */}
        {settings?.travelContent && (
          <>
            <SectionDivider />
            <div className="max-w-3xl mx-auto">
              <div
                className="text-ivory/80 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: settings.travelContent.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
