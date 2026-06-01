import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-border/50">
      <AspectRatio ratio={4 / 5}>
        <Skeleton className="size-full rounded-none" />
      </AspectRatio>
    </div>
  )
}
