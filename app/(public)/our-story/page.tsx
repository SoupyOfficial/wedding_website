import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Photo } from "@/lib/db-types";
import { sanitizeHtml } from "@/lib/sanitize";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Our Story",
  description: "The story of how we found each other.",
};

export default async function OurStoryPage() {
  const gate = await checkFeatureFlag("ourStoryPageEnabled");
  if (gate) return gate;
  const settings = await getSettings("ourStoryContent");

  const photos = await query<Photo>(
    "SELECT * FROM Photo WHERE category = ? ORDER BY sortOrder ASC",
    ["our-story"]
  );

  return (
    <div className="pt-8 pb-16">
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
                __html: sanitizeHtml(settings.ourStoryContent.replace(/\n/g, "<br />")),
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
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

              {photos.map((photo: { id: string; url: string; caption: string | null }, index: number) => (
                <div
                  key={photo.id}
                  className={`flex items-center mb-16 flex-row ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="w-full pl-12 md:pl-0 md:w-1/2 md:px-8">
                    <div className="card-celestial overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || "Our story photo"}
                        className="w-full h-48 md:h-64 object-cover rounded-lg"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <p className="text-ivory/70 text-sm mt-3 italic">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:static transform -translate-x-1/2 md:translate-x-0 w-4 h-4 bg-gold rounded-full border-2 border-midnight z-10 shadow-glow" />
                  <div className="hidden md:block w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
