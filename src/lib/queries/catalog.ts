import "server-only"

import { unstable_cache as cache } from "next/cache"
import { db } from "@/db"
import { categories, subcategories } from "@/db/schema"
import type { MainNavItem } from "@/types"
import { asc, eq } from "drizzle-orm"

import { blogMainNavItem } from "@/config/site"

export async function getCatalogNav() {
  return cache(
    async () => {
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
              title: "Todos",
              href: `/collections/${category.slug}`,
              description:
                category.description ?? `Todos - ${category.name}.`,
              items: [],
            },
            ...categorySubcategories.map((subcategory) => ({
              title: subcategory.name,
              href: `/collections/${category.slug}/${subcategory.slug}`,
              description:
                subcategory.description ?? `Colección ${subcategory.name}.`,
              items: [],
            })),
          ],
        })
      }

      return [...catalogNav, blogMainNavItem]
    },
    ["catalog-nav"],
    {
      revalidate: 3600,
      tags: ["categories", "subcategories", "catalog-nav"],
    }
  )()
}
