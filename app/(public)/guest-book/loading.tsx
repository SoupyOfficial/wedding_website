import { Skeleton, SkeletonText } from "@/components/ui";

export default function GuestBookLoading() {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-40 mx-auto mb-4" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-celestial">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
