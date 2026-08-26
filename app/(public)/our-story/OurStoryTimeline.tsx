"use client";

import { motion } from "framer-motion";
import type { Photo } from "@/lib/db-types";

interface OurStoryTimelineProps {
  photos: Photo[];
}

export default function OurStoryTimeline({ photos }: OurStoryTimelineProps) {
  if (photos.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="heading-gold text-3xl text-center mb-12">
        Our Journey Together
      </h2>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className={`flex items-center mb-16 flex-row ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              delay: (index % 2) * 0.08,
              ease: "easeOut",
            }}
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
