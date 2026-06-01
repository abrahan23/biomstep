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

/** Variaciones dentro de la familia teal — cohesión clínica, no arcoíris. */
const categoryThemes = [
  {
    gradient: "from-teal-950/90 via-slate-950 to-black",
    glow: "bg-teal-400/15",
    ring: "ring-teal-500/20",
  },
  {
    gradient: "from-cyan-950/85 via-slate-950 to-black",
    glow: "bg-cyan-400/12",
    ring: "ring-cyan-500/15",
  },
  {
    gradient: "from-emerald-950/80 via-slate-950 to-black",
    glow: "bg-emerald-400/12",
    ring: "ring-emerald-500/15",
  },
  {
    gradient: "from-sky-950/75 via-slate-950 to-black",
    glow: "bg-sky-400/10",
    ring: "ring-sky-500/15",
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
  const displayIndex = String(index + 1).padStart(2, "0")

  return (
    <Link
      href={`/collections/${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl ring-1 transition-all duration-300",
        "ring-border/40 hover:ring-teal-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
        theme.ring
      )}
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
            className="object-cover opacity-30 mix-blend-luminosity transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-40"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
        <div
          className={cn(
            "absolute -right-6 top-6 size-28 rounded-full opacity-80 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
            theme.glow
          )}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="font-mono text-[10px] font-medium tracking-widest text-white/40">
            {displayIndex}
          </span>
          <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-sm">
            <Icons.product className="size-3.5" aria-hidden="true" />
          </div>
        </div>
      </AspectRatio>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="font-heading text-lg font-semibold capitalize tracking-tight text-white md:text-xl">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/70">
            {category.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <React.Suspense
            fallback={
              <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
            }
          >
            <ProductCount productCountPromise={productCountPromise} />
          </React.Suspense>
          <span className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ArrowRightIcon className="size-3.5" aria-hidden="true" />
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
    <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wide text-white/75">
      <Icons.product className="size-3" aria-hidden="true" />
      {count} {count === 1 ? "producto" : "productos"}
    </div>
  )
}
