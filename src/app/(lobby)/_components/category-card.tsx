import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import {
  getProductCountByCategory,
  type getCategories,
} from "@/lib/queries/product"
import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

const categoryThemes = [
  {
    gradient: "from-teal-500/30 via-cyan-950 to-zinc-950",
    glow: "bg-teal-400/20",
  },
  {
    gradient: "from-blue-500/30 via-indigo-950 to-zinc-950",
    glow: "bg-blue-400/20",
  },
  {
    gradient: "from-violet-500/30 via-purple-950 to-zinc-950",
    glow: "bg-violet-400/20",
  },
  {
    gradient: "from-emerald-500/30 via-teal-950 to-zinc-950",
    glow: "bg-emerald-400/20",
  },
] as const

interface CategoryCardProps {
  category: Awaited<ReturnType<typeof getCategories>>[number]
  index?: number
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const productCountPromise = getProductCountByCategory({
    categoryId: category.id,
  })
  const theme = categoryThemes[index % categoryThemes.length]

  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-border"
    >
      <AspectRatio ratio={4 / 5}>
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            theme.gradient
          )}
          aria-hidden="true"
        />
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            className="object-cover opacity-35 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105 group-hover:opacity-45"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
        <div
          className={cn(
            "absolute -right-8 top-8 size-32 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-110",
            theme.glow
          )}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
          aria-hidden="true"
        />
        <div className="absolute left-5 top-5 flex size-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
          <Icons.product className="size-4" aria-hidden="true" />
        </div>
      </AspectRatio>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="text-lg font-semibold capitalize tracking-tight text-white md:text-xl">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/75">
            {category.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <React.Suspense
            fallback={
              <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
            }
          >
            <ProductCount productCountPromise={productCountPromise} />
          </React.Suspense>
          <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}

interface ProductCountProps {
  productCountPromise: ReturnType<typeof getProductCountByCategory>
}

async function ProductCount({ productCountPromise }: ProductCountProps) {
  const count = await productCountPromise

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
      <Icons.product className="size-3.5" aria-hidden="true" />
      {count} {count === 1 ? "producto" : "productos"}
    </div>
  )
}
