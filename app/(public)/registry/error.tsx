"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function RegistryError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <ErrorState
          title="Couldn't load the registry"
          message="We had trouble fetching the gift registry. Please try again."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
