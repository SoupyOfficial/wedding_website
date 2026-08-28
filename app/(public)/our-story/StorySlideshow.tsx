"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StorySlide } from "./story-slideshow.data";

interface StorySlideshowProps {
  slides: StorySlide[];
}

const AUTOPLAY_INTERVAL = 6000;

export default function StorySlideshow({ slides }: StorySlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  const activeSlide = slides[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-midnight-300/50 border border-gold/20 rounded-2xl backdrop-blur-sm overflow-hidden shadow-glow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={activeSlide.src}
            alt={activeSlide.alt}
            // eslint-disable-next-line @next/next/no-img-element
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </AnimatePresence>

        {/* Prev / Next */}
        <button
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-gold/40 bg-midnight/50 backdrop-blur-sm text-gold hover:bg-gold/10 hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-midnight flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-gold/40 bg-midnight/50 backdrop-blur-sm text-gold hover:bg-gold/10 hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-midnight flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        {/* Caption overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/80 via-midnight/30 to-transparent px-6 pt-16 pb-5">
          <p className="font-serif italic text-ivory/80 text-sm">
            {activeSlide.caption}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 py-4">
        {slides.map((slide, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={slide.src}
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "w-6 h-2 rounded-full bg-gold shadow-glow transition-all duration-300"
                  : "w-2 h-2 rounded-full bg-gold/30 hover:bg-gold/50 transition-colors"
              }
            />
          );
        })}
      </div>
    </motion.div>
  );
}
