import Link from "next/link"

import { homeContent } from "@/config/home"
import { type getCategories } from "@/lib/queries/product"

import { CategoryCard } from "./category-card"
import { HomeSectionHeader } from "./home-section-header"

interface HomeCategoriesProps {
  categories: Awaited<ReturnType<typeof getCategories>>
}

export function HomeCategories({ categories }: HomeCategoriesProps) {
  const { sections } = homeContent

  return (
    <section
      className="relative pt-16 md:pt-20 lg:pt-24"
      aria-labelledby="home-categories-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-[#070b12] to-background"
      />
      <HomeSectionHeader
        eyebrow="Catálogo"
        title={sections.categories.title}
        description={sections.categories.description}
        titleId="home-categories-title"
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Ver todas las categorías
        </Link>
      </div>
    </section>
  )
}
