"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function GuestBookError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <ErrorState title="Couldn't load the guest book" message="We had trouble fetching messages. Please try again." onRetry={reset} />
      </div>
    </div>
  );
}
