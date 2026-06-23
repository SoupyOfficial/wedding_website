import { Skeleton, SkeletonText } from "@/components/ui";

export default function WeddingPartyLoading() {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-celestial text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-5 w-36 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto mb-4" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
