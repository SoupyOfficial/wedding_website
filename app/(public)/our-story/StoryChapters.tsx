"use client";

import { motion } from "framer-motion";

export interface StoryChapter {
  title: string;
  html: string;
}

interface StoryChaptersProps {
  intro: string;
  chapters: StoryChapter[];
}

export default function StoryChapters({ intro, chapters }: StoryChaptersProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {intro ? (
        <div
          className="story-intro mb-16"
          dangerouslySetInnerHTML={{ __html: intro }}
        />
      ) : null}

      <div className="space-y-16 md:space-y-20">
        {chapters.map((chapter, index) => (
          <motion.section
            key={`${chapter.title}-${index}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {chapter.title ? (
              <>
                <h2 className="heading-gold text-2xl md:text-3xl mb-4">
                  {chapter.title}
                </h2>
                <div className="w-12 h-px bg-gold/50 mb-8" />
              </>
            ) : null}

            <div
              className="prose prose-gold"
              dangerouslySetInnerHTML={{ __html: chapter.html }}
            />
          </motion.section>
        ))}
      </div>
    </div>
  );
}
