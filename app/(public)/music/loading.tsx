import { Skeleton } from "@/components/ui";

export default function MusicLoading() {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-44 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 card-celestial py-3">
              <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
