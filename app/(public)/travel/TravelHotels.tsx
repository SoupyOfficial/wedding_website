import type { Hotel } from "@/lib/db-types";
import type { NearbyHotel } from "@/lib/config/travel-content";
import { formatEasternDate } from "@/lib/timezone";

interface Props {
  venueHotels: Hotel[];
  otherHotels: Hotel[];
  nearbyHotels: NearbyHotel[];
}

export default function TravelHotels({ venueHotels, otherHotels, nearbyHotels }: Props) {
  return (
    <div className="mb-16">
      <h2 className="heading-gold text-3xl text-center mb-4">
        Where to Stay
      </h2>
      <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
        We have <span className="text-gold">limited room blocks</span> at the
        on-site venue hotel — once they&apos;re gone, they&apos;re gone!
        Beyond that, there are plenty of great hotels nearby in the Apopka
        and greater Orlando area.
      </p>

      {/* Venue Hotel Room Block */}
      {venueHotels.length > 0 && (
        <>
          <div className="grid gap-6 max-w-2xl mx-auto mb-6">
            {venueHotels.map((hotel) => (
              <div key={hotel.id} className="card-celestial text-center border border-gold/30">
                <div className="text-xs font-semibold uppercase tracking-wider text-gold/90 mb-3">
                  ✨ Venue Room Block ✨
                </div>
                <div className="text-3xl mb-3">🏨</div>
                <h3 className="text-gold font-serif text-2xl mb-2">
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
                    {formatEasternDate(String(hotel.blockDeadline).slice(0, 10))}
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
          <p className="text-center text-ivory/40 text-xs mb-8 italic">
            Room block availability is limited. We recommend booking as soon as possible.
          </p>
        </>
      )}

      {/* Other Hotels (no room block) */}
      {otherHotels.length > 0 && (
        <div className="mt-4">
          <h3 className="text-gold font-serif text-xl text-center mb-2">
            Other Recommended Hotels
          </h3>
          <p className="text-ivory/50 text-center text-sm max-w-2xl mx-auto mb-6">
            No room block at these — but they&apos;re close to the venue and
            well-reviewed options.
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {otherHotels.map((hotel) => (
              <div key={hotel.id} className="card-celestial">
                <h4 className="text-gold font-serif text-base mb-1">🏨 {hotel.name}</h4>
                {hotel.address && (
                  <p className="text-ivory/50 text-xs mb-1">📍 {hotel.address}</p>
                )}
                {hotel.distanceFromVenue && (
                  <p className="text-ivory/50 text-xs mb-1">🚗 {hotel.distanceFromVenue} from venue</p>
                )}
                {hotel.priceRange && (
                  <p className="text-ivory/50 text-xs mb-1">{hotel.priceRange}</p>
                )}
                {hotel.notes && (
                  <p className="text-ivory/60 text-sm mt-2">{hotel.notes}</p>
                )}
                {hotel.website && (
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold/70 text-xs hover:text-gold mt-2 inline-block"
                  >
                    Check Rates →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Nearby Hotels */}
      <div className="mt-12">
        <h3 className="text-gold font-serif text-xl text-center mb-2">
          Other Nearby Hotels
        </h3>
        <p className="text-ivory/50 text-center text-sm max-w-2xl mx-auto mb-6">
          If the venue hotel block is full — or you&apos;d prefer a different
          option — these hotels are all a short drive from the venue.
          Remember: <span className="text-gold/80">check travel time, not just miles!</span>
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {nearbyHotels.map((h) => (
            <div key={h.name} className="card-celestial">
              <h4 className="text-gold font-serif text-base mb-1">🏨 {h.name}</h4>
              <div className="flex items-center gap-3 text-xs text-ivory/50 mb-1">
                <span>📍 {h.area}</span>
                <span>🚗 {h.driveTime}</span>
              </div>
              {h.note && (
                <p className="text-ivory/60 text-xs mb-2">{h.note}</p>
              )}
              {h.searchUrl && (
                <a
                  href={h.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/80 hover:text-gold text-xs underline underline-offset-2"
                >
                  Check Rates →
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-ivory/30 text-[11px] mt-4 italic">
          Search for these hotels on your preferred booking site for current rates.
          Airbnb and VRBO are also great options in the Apopka area.
        </p>
      </div>
    </div>
  );
}
