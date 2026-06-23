import { Skeleton, SkeletonImage } from "@/components/ui";

export default function GalleryLoading() {
  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-32 mx-auto mb-4" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 max-w-6xl mx-auto">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonImage key={i} className={`w-full rounded-xl ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
