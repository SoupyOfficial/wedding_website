import { query, queryOne, toBool } from "@/lib/db";
import type { SiteSettings, Photo } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Our Story",
  description: "The story of how we found each other.",
};

export default async function OurStoryPage() {
  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  const photos = await query<Photo>(
    "SELECT * FROM Photo WHERE category = ? ORDER BY sortOrder ASC",
    ["our-story"]
  );

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Our Story"
          subtitle="How we found each other under the stars"
          className="mb-16"
        />

        {/* Story Content */}
        {settings?.ourStoryContent ? (
          <div className="max-w-3xl mx-auto prose prose-invert prose-gold">
            <div
              className="text-ivory/80 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{
                __html: settings.ourStoryContent.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        ) : (
          <div className="text-center card-celestial max-w-2xl mx-auto">
            <p className="text-ivory/60 text-lg italic">
              Our love story is being written... Check back soon!
            </p>
          </div>
        )}

        <SectionDivider />

        {/* Photo Timeline */}
        {photos.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-gold text-3xl text-center mb-12">
              Our Journey Together
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

              {photos.map((photo: { id: string; url: string; caption: string | null }, index: number) => (
                <div
                  key={photo.id}
                  className={`flex items-center mb-16 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className="w-1/2 px-8">
                    <div className="card-celestial overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || "Our story photo"}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="text-ivory/70 text-sm mt-3 italic">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="w-4 h-4 bg-gold rounded-full border-2 border-midnight z-10 shadow-glow" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
