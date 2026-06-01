import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { type getCategories } from "@/lib/queries/product"

import { CategoryCard } from "./category-card"
import { HomeSectionHeader } from "./home-section-header"

interface HomeCategoriesProps {
  categories: Awaited<ReturnType<typeof getCategories>>
}

export async function HomeCategories({ categories }: HomeCategoriesProps) {
  const t = await getTranslations("Home.sections.categories")

  return (
    <section
      className="relative pt-16 md:pt-20 lg:pt-24"
      aria-labelledby="home-categories-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-20 h-20 bg-gradient-to-b from-[#070b12] via-[#070b12]/60 to-background"
      />
      <HomeSectionHeader
        sectionNumber="01"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        titleId="home-categories-title"
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
      <div className="mt-10 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline dark:text-teal-400"
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  )
}
