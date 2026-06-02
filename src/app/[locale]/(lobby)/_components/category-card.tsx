import * as React from "react"
import Image from "next/image"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"

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
  variant?: "default" | "overlay" | "rail"
  className?: string
}

export function CategoryCard({
  category,
  index = 0,
  variant = "default",
  className,
}: CategoryCardProps) {
  const productCountPromise = getProductCountByCategory({
    categoryId: category.id,
  })
  const theme = categoryThemes[index % categoryThemes.length]
  const displayIndex = String(index + 1).padStart(2, "0")

  const isOverlay = variant === "overlay"
  const isRail = variant === "rail"
  const isGlass = isOverlay || isRail

  if (isRail) {
    return (
      <Link
        href={`/collections/${category.slug}`}
        className={cn(
          "group relative flex gap-3 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-xl transition-all duration-300",
          "hover:border-teal-400/30 hover:bg-white/[0.1] hover:shadow-[0_12px_40px_rgba(20,184,166,0.12)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
          className
        )}
      >
        <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
          {category.image ? (
            <Image
              src={category.image}
              alt=""
              fill
              className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              sizes="96px"
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                theme?.gradient ?? "from-teal-950/90 to-black"
              )}
              aria-hidden="true"
            />
          )}
          <span className="absolute left-1.5 top-1.5 font-mono text-[9px] font-medium tracking-widest text-white/50">
            {displayIndex}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-1">
          <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug tracking-tight text-white">
            {category.name}
          </h3>
          <React.Suspense
            fallback={
              <Skeleton className="h-3 w-20 rounded-full bg-white/15" />
            }
          >
            <ProductCount
              productCountPromise={productCountPromise}
              compact
            />
          </React.Suspense>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center self-center rounded-full border border-white/10 text-white/70 transition-all duration-300 group-hover:border-teal-400/40 group-hover:bg-teal-500/15 group-hover:text-white">
          <ArrowRightIcon className="size-3.5" aria-hidden="true" />
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/collections/${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl ring-1 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
        isGlass
          ? "border border-white/15 bg-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-white/10 backdrop-blur-xl hover:border-white/25 hover:bg-white/[0.12] hover:ring-teal-400/30"
          : cn(
              "ring-border/40 hover:ring-teal-500/30",
              theme?.ring
            ),
        className
      )}
    >
      <AspectRatio ratio={isOverlay ? 1 : 4 / 5}>
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            isOverlay
              ? "from-white/10 via-white/5 to-black/40"
              : (theme?.gradient ?? "from-teal-950/90 to-black")
          )}
          aria-hidden="true"
        />
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-[1.03]",
              isOverlay
                ? "opacity-45 mix-blend-overlay group-hover:opacity-55"
                : "opacity-30 mix-blend-luminosity group-hover:opacity-40"
            )}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
        <div
          className={cn(
            "absolute -right-6 top-6 size-28 rounded-full opacity-80 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
            theme?.glow ?? "bg-teal-400/15"
          )}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute left-5 top-5 flex items-center gap-2",
            isOverlay && "left-4 top-4"
          )}
        >
          <span className="font-mono text-[10px] font-medium tracking-widest text-white/40">
            {displayIndex}
          </span>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-sm",
              isOverlay && "size-8"
            )}
          >
            <Icons.product className="size-3.5" aria-hidden="true" />
          </div>
        </div>
      </AspectRatio>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-5 md:p-6",
          isOverlay && "p-4 md:p-4"
        )}
      >
        <h3
          className={cn(
            "font-heading text-lg font-semibold capitalize tracking-tight text-white md:text-xl",
            isOverlay && "text-base md:text-lg"
          )}
        >
          {category.name}
        </h3>
        {category.description ? (
          <p
            className={cn(
              "mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/70",
              isOverlay && "mt-1 line-clamp-1 text-xs"
            )}
          >
            {category.description}
          </p>
        ) : null}
        <div
          className={cn(
            "mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4",
            isOverlay && "mt-3 pt-3"
          )}
        >
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
  compact?: boolean
}

async function ProductCount({
  productCountPromise,
  compact = false,
}: ProductCountProps) {
  const count = await productCountPromise
  const t = await getTranslations("Common")

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono font-medium tracking-wide text-white/75",
        compact ? "text-[10px]" : "text-[11px]"
      )}
    >
      <Icons.product
        className={cn(compact ? "size-2.5" : "size-3")}
        aria-hidden="true"
      />
      {count} {count === 1 ? t("product") : t("products")}
    </div>
  )
}
