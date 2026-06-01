"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { productOptions, products, productSkus } from "@/db/schema"
import { and, asc, eq, inArray } from "drizzle-orm"

import { getErrorMessage } from "@/lib/handle-error"
import {
  saveProductOptionsSchema,
  saveProductSkusSchema,
  type SaveProductOptionsSchema,
  type SaveProductSkusSchema,
} from "@/lib/validations/variant"

export async function getProductOptions(productId: string) {
  return db
    .select({
      id: productOptions.id,
      name: productOptions.name,
      values: productOptions.values,
      rank: productOptions.rank,
    })
    .from(productOptions)
    .where(eq(productOptions.productId, productId))
    .orderBy(asc(productOptions.rank))
}

export async function getProductSkus(productId: string) {
  return db
    .select({
      id: productSkus.id,
      options: productSkus.options,
      price: productSkus.price,
      inventory: productSkus.inventory,
    })
    .from(productSkus)
    .where(eq(productSkus.productId, productId))
    .orderBy(asc(productSkus.createdAt))
}

/**
 * Returns the option types and SKUs of a product, used both by the storefront
 * variant selector and the admin combination editor.
 */
export async function getProductVariantData(productId: string) {
  const [options, skus] = await Promise.all([
    getProductOptions(productId),
    getProductSkus(productId),
  ])

  return { options, skus }
}

/** Replaces the full set of option types (and their values) for a product. */
export async function saveProductOptions(rawInput: SaveProductOptionsSchema) {
  try {
    const input = saveProductOptionsSchema.parse(rawInput)

    await db.transaction(async (tx) => {
      await tx
        .delete(productOptions)
        .where(eq(productOptions.productId, input.productId))

      if (input.options.length > 0) {
        await tx.insert(productOptions).values(
          input.options.map((option, index) => ({
            productId: input.productId,
            name: option.name,
            // De-duplicate values while preserving order.
            values: [...new Set(option.values.map((v) => v.trim()))].filter(
              Boolean
            ),
            rank: index,
          }))
        )
      }
    })

    revalidatePath(`/admin/products/${input.productId}`)
    revalidatePath(`/product/${input.productId}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

function buildCombinations(
  options: { id: string; values: string[] }[]
): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, option) => {
      const next: Record<string, string>[] = []
      for (const combo of acc) {
        for (const value of option.values) {
          next.push({ ...combo, [option.id]: value })
        }
      }
      return next
    },
    [{}]
  )
}

function comboKey(options: Record<string, string>) {
  return Object.keys(options)
    .sort()
    .map((id) => `${id}:${options[id]}`)
    .join("|")
}

/**
 * Generates the cartesian product of the current option values into SKUs,
 * adding any missing combinations and pruning combinations that are no longer
 * valid. Newly created SKUs default to the product price and zero inventory.
 */
export async function generateProductSkus(productId: string) {
  try {
    const [product, options, existingSkus] = await Promise.all([
      db.query.products.findFirst({
        columns: { price: true },
        where: eq(products.id, productId),
      }),
      getProductOptions(productId),
      getProductSkus(productId),
    ])

    const optionsWithValues = options.filter((o) => o.values.length > 0)

    if (optionsWithValues.length === 0) {
      // No options: remove any leftover SKUs.
      await db.delete(productSkus).where(eq(productSkus.productId, productId))
      revalidatePath(`/admin/products/${productId}`)
      return { data: null, error: null }
    }

    const combinations = buildCombinations(
      optionsWithValues.map((o) => ({ id: o.id, values: o.values }))
    )
    const desiredKeys = new Set(combinations.map(comboKey))
    const existingByKey = new Map(
      existingSkus.map((sku) => [comboKey(sku.options), sku])
    )

    await db.transaction(async (tx) => {
      // Insert missing combinations.
      const toInsert = combinations
        .filter((combo) => !existingByKey.has(comboKey(combo)))
        .map((combo) => ({
          productId,
          options: combo,
          price: product?.price ?? "0",
          inventory: 0,
        }))

      if (toInsert.length > 0) {
        await tx.insert(productSkus).values(toInsert)
      }

      // Prune SKUs that no longer correspond to a valid combination.
      const staleIds = existingSkus
        .filter((sku) => !desiredKeys.has(comboKey(sku.options)))
        .map((sku) => sku.id)

      if (staleIds.length > 0) {
        await tx.delete(productSkus).where(inArray(productSkus.id, staleIds))
      }
    })

    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/product/${productId}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Persists price and inventory edits for a product's SKUs. */
export async function saveProductSkus(rawInput: SaveProductSkusSchema) {
  try {
    const input = saveProductSkusSchema.parse(rawInput)

    await db.transaction(async (tx) => {
      for (const sku of input.skus) {
        if (!sku.id) continue
        await tx
          .update(productSkus)
          .set({ price: sku.price, inventory: sku.inventory })
          .where(
            and(
              eq(productSkus.id, sku.id),
              eq(productSkus.productId, input.productId)
            )
          )
      }
    })

    revalidatePath(`/admin/products/${input.productId}`)
    revalidatePath(`/product/${input.productId}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function deleteProductSku(input: {
  id: string
  productId: string
}) {
  try {
    await db.delete(productSkus).where(eq(productSkus.id, input.id))

    revalidatePath(`/admin/products/${input.productId}`)
    revalidatePath(`/product/${input.productId}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
