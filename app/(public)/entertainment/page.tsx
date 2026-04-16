import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Entertainment } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Entertainment",
  description: "Reception entertainment, activities, and fun for all guests.",
};

export default async function EntertainmentPage() {
  const gate = await checkFeatureFlag("entertainmentPageEnabled");
  if (gate) return gate;

  const entertainment = await query<Entertainment>("SELECT * FROM Entertainment WHERE isVisible = 1 ORDER BY sortOrder ASC");

  const settings = await getSettings("entertainmentNote");

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
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Entertainment"
          subtitle="Get ready for an unforgettable evening of celebration and fun!"
          className="mb-16"
        />

        {/* Entertainment Grid */}
        {entertainment.length === 0 ? (
          <div className="text-center text-ivory/50 py-12 mb-16">
            <p className="text-lg">Entertainment details coming soon!</p>
          </div>
        ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto mb-16">
          {entertainment.map((item: { id: string; name: string; description: string; icon: string | null; sortOrder: number }) => (
            <div
              key={item.id}
              className="card-celestial group hover:scale-105 transition-all duration-300 w-full sm:w-72"
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
        )}

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
