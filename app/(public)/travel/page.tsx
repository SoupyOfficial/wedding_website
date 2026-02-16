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

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Travel & Stay"
          subtitle="Everything you need to know about getting here and where to stay"
          className="mb-16"
        />

        {/* Hotels */}
        <div className="mb-16">
          <h2 className="heading-gold text-3xl text-center mb-8">
            Where to Stay
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {hotels.map((hotel: { id: string; name: string; address: string | null; blockCode: string | null; blockDeadline: Date | null; notes: string | null; bookingLink: string | null; website: string | null }) => (
              <div key={hotel.id} className="card-celestial text-center">
                <div className="text-3xl mb-3">🏨</div>
                <h3 className="text-gold font-serif text-xl mb-2">
                  {hotel.name}
                </h3>
                {hotel.address && (
                  <p className="text-ivory/60 text-sm mb-2">
                    {hotel.address}
                  </p>
                )}
                {hotel.blockCode && (
                  <p className="text-gold/80 text-sm mb-1">
                    Block Code: <span className="font-mono">{hotel.blockCode}</span>
                  </p>
                )}
                {hotel.blockDeadline && (
                  <p className="text-ivory/50 text-xs mb-3">
                    Book by:{" "}
                    {new Date(hotel.blockDeadline).toLocaleDateString()}
                  </p>
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
        </div>

        <SectionDivider />

        {/* Getting There */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="heading-gold text-3xl text-center mb-8">
            Getting There
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-celestial">
              <div className="text-2xl mb-2">✈️</div>
              <h3 className="text-gold font-serif text-lg mb-2">Airports</h3>
              <ul className="text-ivory/70 space-y-1 text-sm">
                <li>• Orlando International Airport (MCO)</li>
                <li>• Orlando Sanford International (SFB)</li>
              </ul>
            </div>
            <div className="card-celestial">
              <div className="text-2xl mb-2">🚗</div>
              <h3 className="text-gold font-serif text-lg mb-2">Getting Around</h3>
              <p className="text-ivory/70 text-sm">
                Rental cars recommended; rideshare available. Local highways: I-4, FL-429, US-441.
              </p>
            </div>
            <div className="card-celestial">
              <div className="text-2xl mb-2">🚄</div>
              <h3 className="text-gold font-serif text-lg mb-2">Brightline</h3>
              <p className="text-ivory/70 text-sm">
                High-speed rail service connecting South Florida to Orlando.
              </p>
            </div>
            <div className="card-celestial">
              <div className="text-2xl mb-2">🌤️</div>
              <h3 className="text-gold font-serif text-lg mb-2">Weather</h3>
              <p className="text-ivory/70 text-sm">
                {settings?.weatherInfo ||
                  "Central Florida can be warm and humid. Dress in light, breathable fabrics."}
              </p>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* Things to Do */}
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-gold text-3xl text-center mb-8">
            Things to Do in the Area
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🏰</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                Walt Disney World
              </h3>
              <p className="text-ivory/60 text-sm">~30 min from venue</p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🎢</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                Universal Studios
              </h3>
              <p className="text-ivory/60 text-sm">~30 min from venue</p>
            </div>
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🐬</div>
              <h3 className="text-gold font-serif text-lg mb-2">
                SeaWorld
              </h3>
              <p className="text-ivory/60 text-sm">~30 min from venue</p>
            </div>
          </div>
          <p className="text-center text-ivory/50 text-sm mt-6 italic">
            A raffle for a theme park ticket may be held at the reception!
          </p>
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
