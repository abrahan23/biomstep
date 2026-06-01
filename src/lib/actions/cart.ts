"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { db } from "@/db"
import { carts, categories, products, stores, subcategories } from "@/db/schema"
import { and, asc, desc, eq, inArray } from "drizzle-orm"
import { type z } from "zod"

import { getErrorMessage } from "@/lib/handle-error"
import {
  cartItemSchema,
  type CartLineItemSchema,
  type deleteCartItemSchema,
  type deleteCartItemsSchema,
} from "@/lib/validations/cart"

export async function getCart(input?: {
  storeId: string
}): Promise<CartLineItemSchema[]> {
  noStore()

  const cartId = cookies().get("cartId")?.value

  if (!cartId) return []

  try {
    const cart = await db.query.carts.findFirst({
      columns: {
        items: true,
      },
      where: eq(carts.id, cartId),
    })

    const productIds = cart?.items?.map((item) => item.productId) ?? []

    if (productIds.length === 0) return []

    const uniqueProductIds = [...new Set(productIds)]

    const productRows = await db
      .select({
        id: products.id,
        name: products.name,
        images: products.images,
        category: categories.name,
        subcategory: subcategories.name,
        price: products.price,
        inventory: products.inventory,
        storeId: products.storeId,
        storeName: stores.name,
        storeStripeAccountId: stores.stripeAccountId,
      })
      .from(products)
      .leftJoin(stores, eq(stores.id, products.storeId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(subcategories, eq(subcategories.id, products.subcategoryId))
      .where(
        and(
          inArray(products.id, uniqueProductIds),
          input?.storeId ? eq(products.storeId, input.storeId) : undefined
        )
      )
      .orderBy(desc(stores.stripeAccountId), asc(products.createdAt))
      .execute()

    const productById = new Map(productRows.map((row) => [row.id, row]))

    // Map over the raw cart items so each variant selection of a product is its
    // own line, preserving the order in which they were added.
    const cartLineItems = (cart?.items ?? []).flatMap((cartItem) => {
      const product = productById.get(cartItem.productId)

      if (!product) return []

      return [
        {
          ...product,
          // Use the selected variant's unit price when present.
          price: cartItem.price != null ? String(cartItem.price) : product.price,
          variant: cartItem.variant ?? null,
          skuId: cartItem.skuId ?? null,
          quantity: cartItem.quantity ?? 0,
        },
      ]
    })

    return cartLineItems
  } catch (err) {
    return []
  }
}

export async function getUniqueStoreIds() {
  noStore()

  const cartId = cookies().get("cartId")?.value

  if (!cartId) return []

  try {
    const cart = await db.query.carts.findFirst({
      columns: {
        items: true,
      },
      where: eq(carts.id, cartId),
    })

    const productIds = [
      ...new Set((cart?.items ?? []).map((item) => item.productId)),
    ]

    if (productIds.length === 0) return []

    const rows = await db
      .selectDistinct({ storeId: products.storeId })
      .from(products)
      .where(inArray(products.id, productIds))

    return rows.map((row) => row.storeId).filter((id): id is string => !!id)
  } catch (err) {
    return []
  }
}

export async function getCartItems(input: { cartId?: string }) {
  noStore()

  if (!input.cartId) return []

  try {
    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, input.cartId),
    })

    return cart?.items
  } catch (err) {
    return []
  }
}

export async function addToCart(rawInput: z.infer<typeof cartItemSchema>) {
  noStore()

  try {
    const input = cartItemSchema.parse(rawInput)

    // Checking if product is in stock
    const product = await db.query.products.findFirst({
      columns: {
        inventory: true,
      },
      where: eq(products.id, input.productId),
    })

    if (!product) {
      throw new Error("Product not found, please try again.")
    }

    if (product.inventory < input.quantity) {
      throw new Error("Product is out of stock, please try again later.")
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      const cart = await db
        .insert(carts)
        .values({
          items: [input],
        })
        .returning({ insertedId: carts.id })

      // Note: .set() is only available in a Server Action or Route Handler
      cookieStore.set("cartId", String(cart[0]?.insertedId))

      revalidatePath("/")
      return {
        data: [input],
        error: null,
      }
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    })

    // TODO: Find a better way to deal with expired carts
    if (!cart) {
      cookieStore.set({
        name: "cartId",
        value: "",
        expires: new Date(0),
      })

      await db.delete(carts).where(eq(carts.id, cartId))

      throw new Error("Cart not found, please try again.")
    }

    // If cart is closed, delete it and create a new one
    if (cart.closed) {
      await db.delete(carts).where(eq(carts.id, cartId))

      const newCart = await db
        .insert(carts)
        .values({
          items: [input],
        })
        .returning({ insertedId: carts.id })

      cookieStore.set("cartId", String(newCart[0]?.insertedId))

      revalidatePath("/")
      return {
        data: [input],
        error: null,
      }
    }

    // Lines are keyed by product + selected variant so different variants of the
    // same product become separate cart lines.
    const cartItem = cart.items?.find(
      (item) =>
        item.productId === input.productId &&
        (item.variant ?? "") === (input.variant ?? "")
    )

    if (cartItem) {
      cartItem.quantity += input.quantity
      cartItem.price = input.price
      cartItem.skuId = input.skuId
    } else {
      cart.items?.push(input)
    }

    await db
      .update(carts)
      .set({
        items: cart.items,
      })
      .where(eq(carts.id, cartId))

    revalidatePath("/")

    return {
      data: cart.items,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateCartItem(rawInput: z.infer<typeof cartItemSchema>) {
  noStore()

  try {
    const input = cartItemSchema.parse(rawInput)

    const cartId = cookies().get("cartId")?.value

    if (!cartId) {
      throw new Error("cartId not found, please try again.")
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    })

    if (!cart) {
      throw new Error("Cart not found, please try again.")
    }

    const cartItem = cart.items?.find(
      (item) =>
        item.productId === input.productId &&
        (item.variant ?? "") === (input.variant ?? "")
    )

    if (!cartItem) {
      throw new Error("CartItem not found, please try again.")
    }

    if (input.quantity === 0) {
      cart.items =
        cart.items?.filter(
          (item) =>
            !(
              item.productId === input.productId &&
              (item.variant ?? "") === (input.variant ?? "")
            )
        ) ?? []
    } else {
      cartItem.quantity = input.quantity
    }

    await db
      .update(carts)
      .set({
        items: cart.items,
      })
      .where(eq(carts.id, cartId))

    revalidatePath("/")

    return {
      data: cart.items,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteCart() {
  noStore()

  try {
    const cartId = cookies().get("cartId")?.value

    if (!cartId) {
      throw new Error("cartId not found, please try again.")
    }

    await db.delete(carts).where(eq(carts.id, cartId))

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

export async function deleteCartItem(
  input: z.infer<typeof deleteCartItemSchema>
) {
  noStore()

  try {
    const cartId = cookies().get("cartId")?.value

    if (!cartId) {
      throw new Error("cartId not found, please try again.")
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    })

    if (!cart) return

    // When a variant is provided, only remove that specific line; otherwise
    // remove every line for the product (board builder behaviour).
    cart.items =
      cart.items?.filter((item) =>
        input.variant !== undefined
          ? !(
              item.productId === input.productId &&
              (item.variant ?? "") === input.variant
            )
          : item.productId !== input.productId
      ) ?? []

    await db
      .update(carts)
      .set({
        items: cart.items,
      })
      .where(eq(carts.id, cartId))

    revalidatePath("/")
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteCartItems(
  input: z.infer<typeof deleteCartItemsSchema>
) {
  noStore()

  try {
    const cartId = cookies().get("cartId")?.value

    if (!cartId) {
      throw new Error("cartId not found, please try again.")
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    })

    if (!cart) return

    cart.items =
      cart.items?.filter(
        (item) => !input.productIds.includes(item.productId)
      ) ?? []

    await db
      .update(carts)
      .set({
        items: cart.items,
      })
      .where(eq(carts.id, cartId))

    revalidatePath("/")

    return {
      data: cart.items,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
