import "server-only"

import { unstable_cache as cache } from "next/cache"
import { db } from "@/db"
import { categories, subcategories } from "@/db/schema"
import type { MainNavItem } from "@/types"
import { asc, eq } from "drizzle-orm"
import { getTranslations } from "next-intl/server"

import { type Locale } from "@/i18n/routing"

export async function getCatalogNav(locale: Locale) {
  return cache(
    async () => {
      const tCommon = await getTranslations({ locale, namespace: "Common" })
      const tNav = await getTranslations({ locale, namespace: "Navigation" })

      const allCategories = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name))

      const catalogNav: MainNavItem[] = []

      for (const category of allCategories) {
        const categorySubcategories = await db
          .select({
            name: subcategories.name,
            slug: subcategories.slug,
            description: subcategories.description,
          })
          .from(subcategories)
          .where(eq(subcategories.categoryId, category.id))
          .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))

        catalogNav.push({
          title: category.name,
          items: [
            {
              title: tCommon("all"),
              href: `/collections/${category.slug}`,
              description:
                category.description ?? `${tCommon("all")} - ${category.name}.`,
              items: [],
            },
            ...categorySubcategories.map((subcategory) => ({
              title: subcategory.name,
              href: `/collections/${category.slug}/${subcategory.slug}`,
              description:
                subcategory.description ??
                `${subcategory.name} collection.`,
              items: [],
            })),
          ],
        })
      }

      const blogMainNavItem: MainNavItem = {
        title: tNav("blog"),
        href: "/blog",
        description: tNav("blogDescription"),
        items: [
          {
            title: tNav("blogAll"),
            href: "/blog",
            description: tNav("blogDescription"),
            items: [],
          },
          {
            title: tNav("blogSurgery"),
            href: "/cirugia-de-pie",
            description: tNav("blogSurgeryDescription"),
            items: [],
          },
        ],
      }

      return [...catalogNav, blogMainNavItem]
    },
    [`catalog-nav-${locale}`],
    {
      revalidate: 3600,
      tags: ["categories", "subcategories", "catalog-nav"],
    }
  )()
}
