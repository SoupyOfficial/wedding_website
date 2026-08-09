import type { Airport, TransportOption, RailOrDriveOption } from "@/lib/config/travel-content";

interface Props {
  airports: Airport[];
  groundTransport: TransportOption[];
  railAndDriving: RailOrDriveOption[];
  parkingInfo: string;
}

export default function TravelGettingThere({ airports, groundTransport, railAndDriving, parkingInfo }: Props) {
  return (
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
              {airport.website && (
                <a
                  href={airport.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gold/80 hover:text-gold text-xs mt-3 underline underline-offset-2"
                >
                  Visit Website →
                </a>
              )}
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
              {opt.website && (
                <a
                  href={opt.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gold/80 hover:text-gold text-xs mt-3 underline underline-offset-2"
                >
                  Visit Website →
                </a>
              )}
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
              {opt.website && (
                <a
                  href={opt.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gold/80 hover:text-gold text-xs mt-3 underline underline-offset-2"
                >
                  {opt.name === "Brightline High-Speed Rail" ? "Book Tickets →" : "Visit Website →"}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
