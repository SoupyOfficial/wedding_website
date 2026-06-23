"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function GalleryError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <ErrorState title="Couldn't load the gallery" message="We had trouble fetching photos. Please try again." onRetry={reset} />
      </div>
    </div>
  );
}
