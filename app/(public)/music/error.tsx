"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function MusicError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <ErrorState title="Couldn't load song requests" message="We had trouble fetching the music list. Please try again." onRetry={reset} />
      </div>
    </div>
  );
}
