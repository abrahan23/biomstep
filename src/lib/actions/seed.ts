import { db } from "@/db"
import {
  categories,
  products,
  stores,
  subcategories,
  type Product,
  type Subcategory,
} from "@/db/schema"
import { faker } from "@faker-js/faker"
import { eq, inArray, notInArray } from "drizzle-orm"

import { catalogSeed, catalogSeedSubcategoryIds } from "@/db/catalog-seed"
import { storeConfig } from "@/config/store"
import { generateId } from "@/lib/id"
import { absoluteUrl } from "@/lib/utils"

export async function revalidateItems() {
  console.log("🔄 Revalidating...")
  await fetch(absoluteUrl("/api/revalidate"))
}

/**
 * Single-store e-commerce: ensure the one canonical store exists with the id
 * referenced by `STORE_ID` everywhere in the app.
 */
export async function seedStore() {
  console.log(`📝 Upserting single store "${storeConfig.name}"`)
  await db
    .insert(stores)
    .values({
      id: storeConfig.id,
      userId: "admin",
      name: storeConfig.name,
      slug: storeConfig.slug,
      description: storeConfig.description,
    })
    .onConflictDoUpdate({
      target: stores.id,
      set: {
        name: storeConfig.name,
        slug: storeConfig.slug,
        description: storeConfig.description,
      },
    })
}

export async function syncCatalogFromSeed() {
  console.log(`📝 Syncing ${catalogSeed.categories.length} categories`)

  for (const [index, category] of catalogSeed.categories.entries()) {
    await db
      .insert(categories)
      .values({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          sortOrder: index,
        },
      })
  }

  const subcategoryRows: Omit<Subcategory, "createdAt" | "updatedAt">[] = []

  for (const category of catalogSeed.categories) {
    for (const [index, subcategory] of category.subcategories.entries()) {
      subcategoryRows.push({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
        categoryId: category.id,
        sortOrder: index,
      })
    }
  }

  console.log(`📝 Syncing ${subcategoryRows.length} subcategories`)

  for (const subcategory of subcategoryRows) {
    await db
      .insert(subcategories)
      .values(subcategory)
      .onConflictDoUpdate({
        target: subcategories.id,
        set: {
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          categoryId: subcategory.categoryId,
          sortOrder: subcategory.sortOrder,
        },
      })
  }

  const configuredSubcategoryIds = catalogSeedSubcategoryIds

  if (configuredSubcategoryIds.length > 0) {
    const orphanSubcategories = await db
      .select({ id: subcategories.id })
      .from(subcategories)
      .where(notInArray(subcategories.id, configuredSubcategoryIds))

    const orphanIds = orphanSubcategories.map((subcategory) => subcategory.id)

    if (orphanIds.length > 0) {
      const orphanDetails = await db
        .select({
          id: subcategories.id,
          categoryId: subcategories.categoryId,
        })
        .from(subcategories)
        .where(inArray(subcategories.id, orphanIds))

      for (const orphan of orphanDetails) {
        const seedCategory = catalogSeed.categories.find(
          (category) => category.id === orphan.categoryId
        )
        const fallbackSubcategory = seedCategory?.subcategories[0]

        await db
          .update(products)
          .set({
            subcategoryId: fallbackSubcategory?.id ?? null,
          })
          .where(eq(products.subcategoryId, orphan.id))
      }

      await db
        .delete(subcategories)
        .where(inArray(subcategories.id, orphanIds))

      console.log(`🧹 Removed ${orphanIds.length} legacy subcategories`)
    }
  }

  console.log("✅ Catalog synced from catalog seed")
}

export async function syncCatalogFromConfig() {
  return syncCatalogFromSeed()
}

export async function seedCategories() {
  await syncCatalogFromSeed()
}

export async function seedSubcategories() {
  await syncCatalogFromSeed()
}

export async function seedProducts({
  storeId,
  count,
}: {
  storeId: string
  count?: number
}) {
  const data: Omit<Product, "createdAt" | "updatedAt">[] = []

  const allCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .execute()
  const categoryIds = allCategories.map((category) => category.id)

  if (categoryIds.length === 0) {
    throw new Error("No categories found. Run seedCategories() first.")
  }

  for (let i = 0; i < (count ?? 10); i++) {
    const categoryId = faker.helpers.shuffle(categoryIds)[0]

    if (!categoryId) {
      throw new Error(`${categoryId} category not found`)
    }

    const allSubcategories = await db
      .select({
        id: subcategories.id,
      })
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))
      .execute()

    data.push({
      id: generateId(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
      originalPrice: faker.commerce.price(),
      status: faker.helpers.shuffle(products.status.enumValues)[0] ?? "active",
      images: null,
      categoryId,
      subcategoryId: faker.helpers.shuffle(allSubcategories)[0]?.id ?? null,
      storeId,
      inventory: faker.number.int({ min: 50, max: 100 }),
      rating: faker.number.int({ min: 0, max: 5 }),
    })
  }

  await db.delete(products).where(eq(products.storeId, storeId))
  console.log(`📝 Inserting ${data.length} products`)
  await db.insert(products).values(data)
}
