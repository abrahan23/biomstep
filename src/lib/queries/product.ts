import "server-only"

import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"
import { db } from "@/db"
import {
  categories,
  products,
  stores,
  subcategories,
  type Product,
} from "@/db/schema"
import type { SearchParams } from "@/types"
import { asc, and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"

import { getProductsSchema } from "@/lib/validations/product"

function normalizeProductSearchInput(input: SearchParams) {
  const normalized: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    normalized[key] = Array.isArray(value) ? value[0] : value
  }

  return normalized
}

// See the unstable_cache API docs: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
export async function getFeaturedProducts() {
  return await cache(
    async () => {
      return db
        .select({
          id: products.id,
          name: products.name,
          images: products.images,
          category: categories.name,
          price: products.price,
          inventory: products.inventory,
          stripeAccountId: stores.stripeAccountId,
        })
        .from(products)
        .limit(8)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .groupBy(products.id, stores.stripeAccountId, categories.name)
        .orderBy(
          desc(count(stores.stripeAccountId)),
          desc(count(products.images)),
          desc(products.createdAt)
        )
    },
    ["featured-products"],
    {
      revalidate: 3600, // every hour
      tags: ["featured-products"],
    }
  )()
}

export async function getBestSellingProducts() {
  return await cache(
    async () => {
      return db
        .select({
          id: products.id,
          name: products.name,
          images: products.images,
          category: categories.name,
          price: products.price,
          inventory: products.inventory,
          stripeAccountId: stores.stripeAccountId,
        })
        .from(products)
        .limit(8)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.status, "active"))
        .groupBy(products.id, stores.stripeAccountId, categories.name)
        .orderBy(desc(products.rating), desc(products.createdAt))
    },
    ["best-selling-products"],
    {
      revalidate: 3600,
      tags: ["best-selling-products"],
    }
  )()
}

// See the unstable_noStore API docs: https://nextjs.org/docs/app/api-reference/functions/unstable_noStore
export async function getProducts(input: SearchParams) {
  noStore()

  try {
    const search = getProductsSchema.parse(normalizeProductSearchInput(input))

    const limit = search.per_page
    const offset = (search.page - 1) * limit

    const [column, order] = (search.sort?.split(".") as [
      keyof Product | undefined,
      "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"]
    const [minPrice, maxPrice] = search.price_range?.split("-") ?? []
    const categoryIds = search.categories?.split(".") ?? []
    const subcategoryIds = search.subcategories?.split(".") ?? []
    const storeIds = search.store_ids?.split(".") ?? []

    const transaction = await db.transaction(async (tx) => {
      const data = await tx
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          images: products.images,
          category: categories.name,
          subcategory: subcategories.name,
          price: products.price,
          inventory: products.inventory,
          rating: products.rating,
          storeId: products.storeId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          stripeAccountId: stores.stripeAccountId,
        })
        .from(products)
        .limit(limit)
        .offset(offset)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
        .where(
          and(
            categoryIds.length > 0
              ? inArray(products.categoryId, categoryIds)
              : undefined,
            subcategoryIds.length > 0
              ? inArray(products.subcategoryId, subcategoryIds)
              : undefined,
            search.active !== "false"
              ? eq(products.status, "active")
              : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined,
            storeIds.length ? inArray(products.storeId, storeIds) : undefined
          )
        )
        .orderBy(
          column && column in products
            ? order === "asc"
              ? asc(products[column])
              : desc(products[column])
            : desc(products.createdAt)
        )

      const total = await tx
        .select({
          count: count(products.id),
        })
        .from(products)
        .where(
          and(
            categoryIds.length > 0
              ? inArray(products.categoryId, categoryIds)
              : undefined,
            subcategoryIds.length > 0
              ? inArray(products.subcategoryId, subcategoryIds)
              : undefined,
            search.active !== "false"
              ? eq(products.status, "active")
              : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined,
            storeIds.length ? inArray(products.storeId, storeIds) : undefined
          )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0)

      const pageCount = Math.ceil(total / limit)

      return {
        data,
        pageCount,
      }
    })

    return transaction
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getProducts]", err)
    }
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getProductCountByCategory({
  categoryId,
}: {
  categoryId: string
}) {
  return await cache(
    async () => {
      return db
        .select({
          count: count(products.id),
        })
        .from(products)
        .where(eq(products.categoryId, categoryId))
        .execute()
        .then((res) => res[0]?.count ?? 0)
    },
    [`product-count-${categoryId}`],
    {
      revalidate: 3600, // every hour
      tags: [`product-count-${categoryId}`],
    }
  )()
}

export async function getCategories() {
  return await cache(
    async () => {
      return db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          image: categories.image,
          sortOrder: categories.sortOrder,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name))
    },
    ["categories"],
    {
      revalidate: 3600, // every hour
      tags: ["categories"],
    }
  )()
}

export async function getCategoryBySlug({ slug }: { slug: string }) {
  noStore()

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image: categories.image,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .execute()
    .then((res) => res[0])
}

export async function getSubcategoryBySlug({ slug }: { slug: string }) {
  noStore()

  return db
    .select({
      id: subcategories.id,
      name: subcategories.name,
      slug: subcategories.slug,
      description: subcategories.description,
      categoryId: subcategories.categoryId,
    })
    .from(subcategories)
    .where(eq(subcategories.slug, slug))
    .execute()
    .then((res) => res[0])
}

export async function getCategorySlugFromId({ id }: { id: string }) {
  return await cache(
    async () => {
      return db
        .select({
          slug: categories.slug,
        })
        .from(categories)
        .where(eq(categories.id, id))
        .execute()
        .then((res) => res[0]?.slug)
    },
    [`category-slug-${id}`],
    {
      revalidate: 3600, // every hour
      tags: [`category-slug-${id}`],
    }
  )()
}

export async function getSubcategories() {
  return await cache(
    async () => {
      return db
        .select({
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
          description: subcategories.description,
          sortOrder: subcategories.sortOrder,
        })
        .from(subcategories)
        .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))
    },
    ["subcategories"],
    {
      revalidate: 3600, // every hour
      tags: ["subcategories"],
    }
  )()
}

export async function getSubcategorySlugFromId({ id }: { id: string }) {
  return await cache(
    async () => {
      return db
        .select({
          slug: subcategories.slug,
        })
        .from(subcategories)
        .where(eq(subcategories.id, id))
        .execute()
        .then((res) => res[0]?.slug)
    },
    [`subcategory-slug-${id}`],
    {
      revalidate: 3600, // every hour
      tags: [`subcategory-slug-${id}`],
    }
  )()
}

export async function getSubcategoriesByCategory({
  categoryId,
}: {
  categoryId: string
}) {
  return await cache(
    async () => {
      return db
        .select({
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
          description: subcategories.description,
          sortOrder: subcategories.sortOrder,
        })
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
        .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))
    },
    [`subcategories-${categoryId}`],
    {
      revalidate: 3600, // every hour
      tags: [`subcategories-${categoryId}`],
    }
  )()
}
