import { query, queryOne, toBool } from "@/lib/db";
import type { Entertainment, SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Entertainment",
  description: "Reception entertainment, activities, and fun for all guests.",
};

export default async function EntertainmentPage() {
  const entertainment = await query<Entertainment>("SELECT * FROM Entertainment ORDER BY sortOrder ASC");

  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

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
        <PageHeader
          title="Entertainment"
          subtitle="Get ready for an unforgettable evening of celebration and fun!"
          className="mb-16"
        />

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
