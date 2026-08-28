import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Photo } from "@/lib/db-types";
import { sanitizeHtml } from "@/lib/sanitize";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import OurStoryTimeline from "./OurStoryTimeline";
import StoryChapters, { type StoryChapter } from "./StoryChapters";
import StorySlideshow from "./StorySlideshow";
import { storySlideshowImages } from "./story-slideshow.data";

export const metadata = {
  title: "Our Story",
  description: "The story of how we found each other.",
};

function splitStoryChapters(html: string): {
  intro: string;
  chapters: StoryChapter[];
} {
  const chapterRegex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches = [...html.matchAll(chapterRegex)];

  if (matches.length === 0) {
    return { intro: "", chapters: [{ title: "", html }] };
  }

  const intro = html.slice(0, matches[0].index).trim();

  const chapters = matches.map((match, index) => {
    const title = match[1].replace(/<[^>]*>/g, "").trim();
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd =
      index + 1 < matches.length
        ? (matches[index + 1].index ?? html.length)
        : html.length;
    const body = html.slice(bodyStart, bodyEnd).trim();
    return { title, html: body };
  });

  return { intro, chapters };
}

export default async function OurStoryPage() {
  const gate = await checkFeatureFlag("ourStoryPageEnabled");
  if (gate) return gate;
  const settings = await getSettings("ourStoryContent");

  const photos = await query<Photo>(
    "SELECT * FROM Photo WHERE category = ? ORDER BY sortOrder ASC",
    ["our-story"]
  );

  const story = settings?.ourStoryContent
    ? splitStoryChapters(sanitizeHtml(settings.ourStoryContent))
    : null;

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Our Story"
          subtitle="How we found each other under the stars"
          className="mb-10"
        />

        <div className="max-w-4xl mx-auto mb-16">
          <StorySlideshow slides={storySlideshowImages} />
        </div>

        {/* Story Content */}
        {story ? (
          <StoryChapters intro={story.intro} chapters={story.chapters} />
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
