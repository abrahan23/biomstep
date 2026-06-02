import { Link } from "@/i18n/routing"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { getTranslations } from "next-intl/server"

import { type getCategories } from "@/lib/queries/product"
import { cn } from "@/lib/utils"

import { CategoryCard } from "./category-card"

/** Ancho máximo de cada carril — el centro queda libre para el vídeo. */
const RAIL_WIDTH = "minmax(240px, 420px)"

interface HomeCategoriesRevealProps {
  categories: Awaited<ReturnType<typeof getCategories>>
}

export async function HomeCategoriesReveal({
  categories,
}: HomeCategoriesRevealProps) {
  const t = await getTranslations("Home.sections.categories")
  const midpoint = Math.ceil(categories.length / 2)
  const leftCategories = categories.slice(0, midpoint)
  const rightCategories = categories.slice(midpoint)

  return (
    <section
      id="home-categories"
      className="relative w-full"
      aria-labelledby="home-categories-title"
    >
      <h2 id="home-categories-title" className="sr-only">
        {t("title")}
      </h2>

      {/* Móvil / tablet: apilado; el vídeo se ve entre bloques al hacer scroll */}
      <div className="lg:hidden">
        <header className="mb-8 text-center md:mb-10">
          <CategoriesSectionLabel />
          <p className="tracking-overline mt-3 text-xs font-semibold uppercase text-teal-300/90">
            {t("eyebrow")}
          </p>
          <p
            aria-hidden="true"
            className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl"
          >
            {t("title")}
          </p>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-white/75">
            {t("description")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              variant="rail"
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <CategoriesViewAllLink label={t("viewAll")} />
        </div>
      </div>

      {/* Desktop: carriles en extremos + centro vacío (vídeo visible) */}
      <div
        className="relative mx-auto hidden w-full max-w-[1320px] lg:grid lg:items-center"
        style={{
          gridTemplateColumns: `${RAIL_WIDTH} minmax(220px, 1fr) ${RAIL_WIDTH}`,
          minHeight: "min(72vh, 720px)",
          columnGap: "clamp(1.5rem, 3vw, 3rem)",
        }}
      >
        <aside
          className={cn(
            "flex flex-col justify-center gap-6",
            leftCategories.length === 0 && "invisible"
          )}
        >
          <header className="space-y-3">
            <CategoriesSectionLabel />
            <p className="tracking-overline text-[11px] font-semibold uppercase text-teal-300/90">
              {t("eyebrow")}
            </p>
            <p
              aria-hidden="true"
              className="text-balance font-heading text-[1.6rem] font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)] xl:text-[1.85rem]"
            >
              {t("title")}
            </p>
            <p className="max-w-[280px] text-pretty text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
          </header>

          <nav className="flex flex-col gap-3" aria-label={t("title")}>
            {leftCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                variant="rail"
              />
            ))}
          </nav>
        </aside>

        {/* Centro vacío: el vídeo con scroll-scrub permanece visible */}
        <div className="pointer-events-none" aria-hidden="true" />

        <aside
          className={cn(
            "flex flex-col justify-center gap-6",
            rightCategories.length === 0 && "invisible"
          )}
        >
          <nav className="flex flex-col gap-3" aria-label={t("title")}>
            {rightCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={midpoint + index}
                variant="rail"
              />
            ))}
          </nav>

          <div className="flex justify-end pt-2">
            <CategoriesViewAllLink label={t("viewAll")} />
          </div>
        </aside>
      </div>
    </section>
  )
}

function CategoriesSectionLabel() {
  return (
    <div className="flex items-center gap-3">
      <span className="tracking-overline font-mono text-[11px] font-medium text-teal-300/80">
        01
      </span>
      <span
        aria-hidden="true"
        className="h-px w-12 bg-gradient-to-r from-teal-400/50 to-transparent sm:w-16"
      />
    </div>
  )
}

function CategoriesViewAllLink({ label }: { label: string }) {
  return (
    <Link
      href="/products"
      className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-200 hover:border-teal-400/35 hover:bg-white/[0.12] hover:shadow-[0_8px_32px_rgba(20,184,166,0.15)]"
    >
      {label}
      <ArrowRightIcon
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  )
}
