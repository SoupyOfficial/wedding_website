import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "Entertainment",
  description: "Reception entertainment, activities, and fun for all guests.",
};

export default async function EntertainmentPage() {
  const entertainment = await prisma.entertainment.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  const iconMap: Record<string, string> = {
    dj: "🎧",
    photobooth: "📸",
    lawn_games: "🎯",
    fireworks: "🎆",
    sparklers: "✨",
    dancing: "💃",
    karaoke: "🎤",
    raffle: "🎟️",
    default: "🎉",
  };

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Entertainment
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Get ready for an unforgettable evening of celebration and fun!
          </p>
        </div>

        {/* Entertainment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {entertainment.map((item: { id: string; name: string; description: string; icon: string | null; sortOrder: number }) => (
            <div
              key={item.id}
              className="card-celestial group hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  {item.icon || iconMap[item.name.toLowerCase().replace(/\s+/g, "_")] || iconMap.default}
                </div>
                <h3 className="text-gold font-serif text-xl mb-2">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-ivory/70 text-sm mb-3">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <SectionDivider />

        {/* Special Notes */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-gold text-3xl mb-6">
            A Night Under the Stars
          </h2>
          <p className="text-ivory/70 mb-4">
            {settings?.entertainmentNote ||
              "Our reception will be a celebration filled with music, dancing, games, and memories! We want everyone to have an incredible time."}
          </p>
          <p className="text-ivory/60 text-sm italic">
            More surprises may be in store — stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
