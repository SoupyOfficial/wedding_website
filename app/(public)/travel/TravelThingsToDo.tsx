import type { FeaturedPark, ThemePark, Restaurant, LocalActivity } from "@/lib/config/travel-content";

interface Props {
  featuredPark: FeaturedPark;
  themeParks: ThemePark[];
  restaurants: Restaurant[];
  localActivities: LocalActivity[];
  raffleTicketCount: number;
}

export default function TravelThingsToDo({
  featuredPark,
  themeParks,
  restaurants,
  localActivities,
  raffleTicketCount,
}: Props) {
  return (
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
              {featuredPark.website && (
                <a
                  href={featuredPark.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm px-4 py-2 inline-block"
                >
                  Explore Universal Orlando →
                </a>
              )}
            </div>
          </div>
          {raffleTicketCount > 0 && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center mt-2">
              <p className="text-gold font-serif text-lg mb-1">🎟️ Universal Ticket Raffle!</p>
              <p className="text-ivory/70 text-sm">
                Two lucky winners will each win a pair of one-day Universal Studios &amp; Islands of Adventure tickets — drawn live at the reception! Every RSVP is automatically entered, and additional raffle tickets will be available for purchase at the reception.
              </p>
              <p className="text-ivory/40 text-xs mt-2 italic">
                Full details on the Raffle page. Winners must be present to win.
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
            <p className="text-ivory/50 text-xs mb-2">{park.description}</p>
            {park.website && (
              <a
                href={park.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/80 hover:text-gold text-xs underline underline-offset-2"
              >
                Visit Website →
              </a>
            )}
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
              <p className="text-ivory/60 text-xs mb-2">{r.description}</p>
              <div className="flex gap-3">
                {r.website && (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold/80 hover:text-gold text-xs underline underline-offset-2"
                  >
                    Website →
                  </a>
                )}
                {r.mapUrl && (
                  <a
                    href={r.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold/80 hover:text-gold text-xs underline underline-offset-2"
                  >
                    Map →
                  </a>
                )}
              </div>
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
              <p className="text-ivory/50 text-xs mb-2">{a.description}</p>
              {a.website && (
                <a
                  href={a.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/80 hover:text-gold text-xs underline underline-offset-2"
                >
                  Learn More →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {raffleTicketCount > 0 && (
        <div className="text-center bg-royal/20 border border-gold/20 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-gold font-serif text-xl mb-2">🎉 Don&apos;t Forget!</p>
          <p className="text-ivory/70 text-sm">
            We&apos;re giving away 2 pairs of Universal theme park tickets at the reception — one pair each to two lucky winners! Every RSVP is automatically entered, and extra raffle tickets will be available for purchase at the reception.
          </p>
          <p className="text-ivory/40 text-xs mt-2 italic">
            Full details on the Raffle page. Winners must be present to win.
          </p>
        </div>
      )}
    </div>
  );
}
