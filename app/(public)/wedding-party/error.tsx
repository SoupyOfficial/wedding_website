"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function WeddingPartyError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <ErrorState title="Couldn't load the wedding party" message="We had trouble fetching member profiles. Please try again." onRetry={reset} />
      </div>
    </div>
  );
}
