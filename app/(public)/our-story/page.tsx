import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Photo } from "@/lib/db-types";
import { sanitizeHtml } from "@/lib/sanitize";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import OurStoryTimeline from "./OurStoryTimeline";

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
                __html: sanitizeHtml(settings.ourStoryContent),
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
        <OurStoryTimeline photos={photos} />
      </div>
    </div>
  );
}
