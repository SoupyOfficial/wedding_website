import { Skeleton, SkeletonCard } from "@/components/ui";

export default function RegistryLoading() {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
