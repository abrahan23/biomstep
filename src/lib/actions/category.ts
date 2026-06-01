"use server"

import {
  revalidatePath,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache"
import { db } from "@/db"
import { categories, products, subcategories } from "@/db/schema"
import { and, asc, count, eq, ne, sql } from "drizzle-orm"

import { generateId } from "@/lib/id"
import { getErrorMessage } from "@/lib/handle-error"
import { slugify } from "@/lib/utils"
import {
  categorySchema,
  reorderSchema,
  subcategorySchema,
  type CategorySchema,
  type SubcategorySchema,
} from "@/lib/validations/category"

async function revalidateCatalog() {
  revalidatePath("/")
  revalidatePath("/admin/categories")
  revalidateTag("categories")
  revalidateTag("subcategories")
  revalidateTag("catalog-nav")
}

export async function getAdminCatalog() {
  noStore()

  const allCategories = await db
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

  const allSubcategories = await db
    .select({
      id: subcategories.id,
      name: subcategories.name,
      slug: subcategories.slug,
      description: subcategories.description,
      categoryId: subcategories.categoryId,
      sortOrder: subcategories.sortOrder,
    })
    .from(subcategories)
    .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))

  return allCategories.map((category) => ({
    ...category,
    subcategories: allSubcategories.filter(
      (subcategory) => subcategory.categoryId === category.id
    ),
  }))
}

async function getNextCategorySortOrder() {
  const [result] = await db
    .select({
      max: sql<number>`coalesce(max(${categories.sortOrder}), -1)`,
    })
    .from(categories)

  return (result?.max ?? -1) + 1
}

async function getNextSubcategorySortOrder(categoryId: string) {
  const [result] = await db
    .select({
      max: sql<number>`coalesce(max(${subcategories.sortOrder}), -1)`,
    })
    .from(subcategories)
    .where(eq(subcategories.categoryId, categoryId))

  return (result?.max ?? -1) + 1
}

async function assertUniqueCategorySlug(slug: string, excludeId?: string) {
  const existing = await db.query.categories.findFirst({
    columns: { id: true },
    where: excludeId
      ? and(eq(categories.slug, slug), ne(categories.id, excludeId))
      : eq(categories.slug, slug),
  })

  if (existing) {
    throw new Error("Ya existe una categoría con ese slug.")
  }
}

async function assertUniqueSubcategorySlug(slug: string, excludeId?: string) {
  const existing = await db.query.subcategories.findFirst({
    columns: { id: true },
    where: excludeId
      ? and(eq(subcategories.slug, slug), ne(subcategories.id, excludeId))
      : eq(subcategories.slug, slug),
  })

  if (existing) {
    throw new Error("Ya existe una subcategoría con ese slug.")
  }
}

export async function createCategory(input: CategorySchema) {
  try {
    const data = categorySchema.parse(input)
    await assertUniqueCategorySlug(data.slug)

    const [category] = await db
      .insert(categories)
      .values({
        id: generateId("category"),
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image || null,
        sortOrder: await getNextCategorySortOrder(),
      })
      .returning({ id: categories.id })

    await revalidateCatalog()

    return { data: category, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateCategory({
  id,
  ...input
}: CategorySchema & { id: string }) {
  try {
    const data = categorySchema.parse(input)
    await assertUniqueCategorySlug(data.slug, id)

    await db
      .update(categories)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image || null,
      })
      .where(eq(categories.id, id))

    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function deleteCategory({ id }: { id: string }) {
  try {
    const [productCount] = await db
      .select({ count: count(products.id) })
      .from(products)
      .where(eq(products.categoryId, id))

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "No se puede eliminar una categoría con productos asignados."
      )
    }

    await db.delete(categories).where(eq(categories.id, id))
    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function createSubcategory(input: SubcategorySchema) {
  try {
    const data = subcategorySchema.parse(input)
    await assertUniqueSubcategorySlug(data.slug)

    const [subcategory] = await db
      .insert(subcategories)
      .values({
        id: generateId("subcategory"),
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        categoryId: data.categoryId,
        sortOrder: await getNextSubcategorySortOrder(data.categoryId),
      })
      .returning({ id: subcategories.id })

    await revalidateCatalog()

    return { data: subcategory, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateSubcategory({
  id,
  ...input
}: SubcategorySchema & { id: string }) {
  try {
    const data = subcategorySchema.parse(input)
    await assertUniqueSubcategorySlug(data.slug, id)

    await db
      .update(subcategories)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        categoryId: data.categoryId,
      })
      .where(eq(subcategories.id, id))

    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function deleteSubcategory({ id }: { id: string }) {
  try {
    const [productCount] = await db
      .select({ count: count(products.id) })
      .from(products)
      .where(eq(products.subcategoryId, id))

    if ((productCount?.count ?? 0) > 0) {
      throw new Error(
        "No se puede eliminar una subcategoría con productos asignados."
      )
    }

    await db.delete(subcategories).where(eq(subcategories.id, id))
    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function reorderCategories(input: { orderedIds: string[] }) {
  try {
    const { orderedIds } = reorderSchema.parse(input)

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(categories)
          .set({ sortOrder: index })
          .where(eq(categories.id, id))
      }
    })

    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function reorderSubcategories(input: {
  categoryId: string
  orderedIds: string[]
}) {
  try {
    const { orderedIds } = reorderSchema.parse(input)

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(subcategories)
          .set({ sortOrder: index })
          .where(
            and(
              eq(subcategories.id, id),
              eq(subcategories.categoryId, input.categoryId)
            )
          )
      }
    })

    await revalidateCatalog()

    return { error: null }
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}

export async function suggestCategorySlug(name: string) {
  return slugify(name)
}
