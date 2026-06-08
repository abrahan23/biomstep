"use server"

import { unstable_noStore as noStore, revalidatePath, revalidateTag } from "next/cache"
import { db } from "@/db"
import { categories, products } from "@/db/schema"
import type { StoredFile } from "@/types"
import { and, asc, eq, ilike } from "drizzle-orm"
import { type z } from "zod"

import { getErrorMessage } from "@/lib/handle-error"
import {
  type CreateProductSchema,
  type createProductSchema,
  filterProductsSchema,
  type updateProductRatingSchema,
} from "@/lib/validations/product"

export async function filterProducts({ query }: { query: string }) {
  noStore()
  try {
    const { query: searchQuery } = filterProductsSchema.parse({ query })
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery.length === 0) {
      return {
        data: null,
        error: null,
      }
    }

    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "active"),
          ilike(products.name, `%${trimmedQuery}%`)
        )
      )
      .orderBy(asc(categories.sortOrder), asc(products.name))
      .limit(50)

    const grouped = new Map<
      string,
      { name: string; products: { id: string; name: string }[] }
    >()

    for (const row of rows) {
      const group = grouped.get(row.categoryId) ?? {
        name: row.categoryName,
        products: [],
      }

      group.products.push({
        id: row.productId,
        name: row.productName,
      })
      grouped.set(row.categoryId, group)
    }

    return {
      data: Array.from(grouped.values()),
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function addProduct(
  input: Omit<CreateProductSchema, "images"> & {
    storeId: string
    images: StoredFile[]
  }
) {
  try {
    const productWithSameName = await db.query.products.findFirst({
      columns: {
        id: true,
      },
      where: eq(products.name, input.name),
    })

    if (productWithSameName) {
      throw new Error("Product name already taken.")
    }

    const { storeId, images, ...data } = input

    await db.insert(products).values({
      ...data,
      storeId,
      images,
    })

    revalidatePath(`/admin/products`)
    revalidateTag("best-selling-products")
    revalidateTag("featured-products")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateProduct(
  input: Omit<CreateProductSchema, "images"> & {
    id: string
    storeId: string
    images: StoredFile[]
  }
) {
  try {
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, input.id),
        eq(products.storeId, input.storeId)
      ),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    const { id, storeId, images, ...data } = input

    await db
      .update(products)
      .set({
        ...data,
        images,
      })
      .where(eq(products.id, id))

    revalidatePath(`/admin/products/${input.id}`)
    revalidateTag("best-selling-products")
    revalidateTag("featured-products")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateProductRating(
  input: z.infer<typeof updateProductRatingSchema>
) {
  try {
    const product = await db.query.products.findFirst({
      columns: {
        id: true,
        rating: true,
      },
      where: eq(products.id, input.id),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    await db
      .update(products)
      .set({ rating: input.rating })
      .where(eq(products.id, input.id))

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteProduct(input: { id: string; storeId: string }) {
  try {
    const product = await db.query.products.findFirst({
      columns: {
        id: true,
      },
      where: and(
        eq(products.id, input.id),
        eq(products.storeId, input.storeId)
      ),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    await db.delete(products).where(eq(products.id, input.id))

    revalidatePath(`/admin/products`)
    revalidateTag("best-selling-products")
    revalidateTag("featured-products")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
