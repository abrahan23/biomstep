import { Skeleton } from "@/components/ui/skeleton"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Shell } from "@/components/shell"

import { CategoryCardSkeleton } from "./category-card-skeleton"

export function LobbySkeleton() {
  return (
    <>
      <section className="relative h-[100dvh] w-full bg-[#070b12]">
        <div className="container flex h-full flex-col justify-center gap-6 pt-20">
          <Skeleton className="h-7 w-48 rounded-full bg-white/10" />
          <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
          <Skeleton className="h-20 w-full max-w-lg bg-white/10" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-md bg-white/10" />
            <Skeleton className="h-11 w-40 rounded-md bg-white/10" />
          </div>
        </div>
      </section>
      <Shell className="max-w-6xl gap-0">
        <section className="pt-16 md:pt-20 lg:pt-24">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-3 h-10 w-72 max-w-full" />
          <Skeleton className="mb-10 h-6 w-full max-w-lg" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="py-16 md:py-20 lg:py-24">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-3 h-10 w-80 max-w-full" />
          <Skeleton className="mb-10 h-6 w-full max-w-xl" />
          <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="border-y bg-muted/30 py-16 md:py-20 lg:py-24">
          <Skeleton className="mx-auto mb-12 h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </section>
        <section className="py-16 md:py-20 lg:py-24">
          <Skeleton className="mx-auto mb-12 h-10 w-48" />
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </section>
        <section className="pb-16 pt-4 md:pb-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Skeleton className="mb-3 h-4 w-16" />
              <Skeleton className="mb-3 h-10 w-48" />
              <Skeleton className="h-20 w-full max-w-sm" />
            </div>
            <div className="lg:col-span-8">
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        </section>
      </Shell>
    </>
  )
}
