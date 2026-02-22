import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Travel & Stay",
  description: "Hotels, travel information, and things to do near the wedding venue.",
};

export default async function TravelPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  const hotels = await prisma.hotel.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const raffleTicketCount = settings?.raffleTicketCount ?? 2;

  return (
    <div className="pt-24 pb-16">
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
            {hotels.map((hotel: { id: string; name: string; address: string | null; blockCode: string | null; blockDeadline: Date | null; notes: string | null; bookingLink: string | null; website: string | null; phone: string | null; distanceFromVenue: string | null; priceRange: string | null; amenities: string | null }) => (
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
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">
                  Orlando International Airport (MCO)
                </h4>
                <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
                  Recommended — Most Flights
                </p>
                <ul className="text-ivory/70 space-y-1.5 text-sm">
                  <li>• ~35 minutes from the venue</li>
                  <li>• Major hub with direct flights from most U.S. cities</li>
                  <li>• All major airlines (Delta, United, American, Southwest, JetBlue, Spirit, Frontier)</li>
                  <li>• Car rental counters on-site at the terminal</li>
                  <li>• Rideshare pickup at Level 2 of the terminal garages</li>
                </ul>
              </div>
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">
                  Orlando Sanford International (SFB)
                </h4>
                <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
                  Budget-Friendly Alternative
                </p>
                <ul className="text-ivory/70 space-y-1.5 text-sm">
                  <li>• ~40 minutes from the venue</li>
                  <li>• Smaller, less crowded airport</li>
                  <li>• Budget carriers (Allegiant Air, international charters)</li>
                  <li>• Fewer rental car options — book in advance</li>
                  <li>• Good option if coming from smaller regional airports</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ground Transportation */}
          <div className="mb-8">
            <h3 className="text-gold font-serif text-xl text-center mb-4">🚗 Ground Transportation</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">Rental Cars</h4>
                <p className="text-ivory/70 text-sm mb-2">
                  Highly recommended for getting around Orlando. The venue and most attractions require driving.
                </p>
                <ul className="text-ivory/60 space-y-1 text-sm">
                  <li>• Available at both airports</li>
                  <li>• Enterprise, Hertz, National, Budget, Avis</li>
                  <li>• Free parking available at the venue</li>
                </ul>
              </div>
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">Rideshare</h4>
                <p className="text-ivory/70 text-sm mb-2">
                  Uber and Lyft are widely available throughout Orlando and surrounding areas.
                </p>
                <ul className="text-ivory/60 space-y-1 text-sm">
                  <li>• Airport to venue: ~$25–40</li>
                  <li>• Available 24/7</li>
                  <li>• Great for evenings out or the wedding itself</li>
                </ul>
              </div>
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">Shuttle & Taxi</h4>
                <p className="text-ivory/70 text-sm mb-2">
                  Hotel shuttles and taxi services are also available options.
                </p>
                <ul className="text-ivory/60 space-y-1 text-sm">
                  <li>• Many hotels offer complimentary airport shuttles</li>
                  <li>• Mears Transportation for pre-booked shuttles</li>
                  <li>• Taxis available at airport taxi stands</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rail & Driving */}
          <div>
            <h3 className="text-gold font-serif text-xl text-center mb-4">🚄 Rail & Driving</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">Brightline High-Speed Rail</h4>
                <p className="text-ivory/70 text-sm mb-2">
                  Florida&apos;s high-speed rail service connects South Florida to Orlando in comfort and style.
                </p>
                <ul className="text-ivory/60 space-y-1 text-sm">
                  <li>• Stations: Miami, Fort Lauderdale, Aventura, Boca Raton, West Palm Beach → Orlando</li>
                  <li>• Orlando station at the airport (MCO)</li>
                  <li>• Travel time: ~3–3.5 hours from Miami</li>
                  <li>• Smart (economy) and Premium class seating</li>
                  <li>• Book at <span className="text-gold/80">gobrightline.com</span></li>
                </ul>
              </div>
              <div className="card-celestial">
                <h4 className="text-gold font-serif text-lg mb-2">Driving Directions</h4>
                <p className="text-ivory/70 text-sm mb-2">
                  Orlando is centrally located in Florida and easily accessible by car.
                </p>
                <ul className="text-ivory/60 space-y-1 text-sm">
                  <li>• From Miami: ~3.5 hours via Florida&apos;s Turnpike</li>
                  <li>• From Tampa: ~1.5 hours via I-4 East</li>
                  <li>• From Jacksonville: ~2 hours via I-95 South → I-4 West</li>
                  <li>• Key highways near the venue: I-4, FL-429, US-441</li>
                  <li>• {settings?.parkingInfo || "Free parking is available on-site at the venue"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* Weather */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="heading-gold text-3xl text-center mb-4">
            🌤️ Weather & What to Pack
          </h2>
          <div className="card-celestial">
            <p className="text-ivory/70 text-sm mb-4">
              {settings?.weatherInfo ||
                "Central Florida can be warm and humid. The ceremony is outdoors, so we recommend light, breathable fabrics. The reception is indoors and air-conditioned."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🌡️</div>
                <p className="text-ivory/50 text-xs">Avg. High</p>
                <p className="text-gold font-semibold">85–95°F</p>
              </div>
              <div>
                <div className="text-2xl mb-1">💧</div>
                <p className="text-ivory/50 text-xs">Humidity</p>
                <p className="text-gold font-semibold">High</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🌧️</div>
                <p className="text-ivory/50 text-xs">Rain</p>
                <p className="text-gold font-semibold">Possible PM showers</p>
              </div>
              <div>
                <div className="text-2xl mb-1">👗</div>
                <p className="text-ivory/50 text-xs">Tip</p>
                <p className="text-gold font-semibold">Light fabrics</p>
              </div>
            </div>
          </div>
        </div>

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
                  <div className="text-4xl mb-3">🎢</div>
                  <h3 className="text-gold font-serif text-2xl mb-2">
                    Universal Orlando Resort
                  </h3>
                  <p className="text-ivory/70 text-sm mb-4">
                    Home to some of the most thrilling rides and immersive experiences in the world.
                    With three incredible theme parks, there&apos;s something for everyone — from
                    The Wizarding World of Harry Potter to epic roller coasters and brand-new worlds to explore.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-royal/30 rounded-lg p-3 text-center">
                      <p className="text-gold font-serif text-sm font-bold">Universal Studios</p>
                      <p className="text-ivory/50 text-xs mt-1">Movies come to life — rides, shows, & Diagon Alley</p>
                    </div>
                    <div className="bg-royal/30 rounded-lg p-3 text-center">
                      <p className="text-gold font-serif text-sm font-bold">Islands of Adventure</p>
                      <p className="text-ivory/50 text-xs mt-1">Hogwarts, Jurassic World, & thrill rides</p>
                    </div>
                    <div className="bg-royal/30 rounded-lg p-3 text-center">
                      <p className="text-gold font-serif text-sm font-bold">Epic Universe</p>
                      <p className="text-ivory/50 text-xs mt-1">Brand new park — How to Train Your Dragon, Super Nintendo World, & more</p>
                    </div>
                  </div>
                  <ul className="text-ivory/60 space-y-1 text-sm mb-4">
                    <li>• ~30 minutes from the venue</li>
                    <li>• Multi-day and park-to-park tickets available</li>
                    <li>• On-site resort hotels with Early Park Admission perks</li>
                    <li>• CityWalk dining & nightlife included with park admission</li>
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
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🏰</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                Walt Disney World
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~30 min from venue</p>
              <p className="text-ivory/50 text-xs">
                Four theme parks — Magic Kingdom, EPCOT, Hollywood Studios, and Animal Kingdom.
                Plus Disney Springs for shopping & dining.
              </p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🐬</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                SeaWorld Orlando
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~35 min from venue</p>
              <p className="text-ivory/50 text-xs">
                Marine life encounters, roller coasters, and shows.
                Also check out Aquatica water park nearby.
              </p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌊</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                LEGOLAND Florida
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~45 min from venue</p>
              <p className="text-ivory/50 text-xs">
                Perfect for families with younger kids.
                Interactive rides, building experiences, and a water park.
              </p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🏌️</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                TopGolf Orlando
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~25 min from venue</p>
              <p className="text-ivory/50 text-xs">
                High-tech driving range with games, food, drinks, and entertainment for groups.
              </p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🛍️</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                Orlando Premium Outlets
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~30 min from venue</p>
              <p className="text-ivory/50 text-xs">
                Two locations with 150+ designer and name-brand stores at discounted prices.
              </p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                Wekiwa Springs State Park
              </h3>
              <p className="text-ivory/60 text-sm mb-2">~15 min from venue</p>
              <p className="text-ivory/50 text-xs">
                Natural Florida at its best — crystal-clear springs, kayaking, hiking trails, and wildlife.
              </p>
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
