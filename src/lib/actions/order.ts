"use server"

import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"
import { db } from "@/db"
import {
  addresses,
  carts,
  categories,
  orders,
  products,
  productSkus,
  subcategories,
  type Order,
} from "@/db/schema"
import type { SearchParams } from "@/types"
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  sql,
} from "drizzle-orm"
import type Stripe from "stripe"
import { z } from "zod"

import { STORE_ID } from "@/config/store"
import {
  checkoutItemSchema,
  type CartLineItemSchema,
  type CheckoutItemSchema,
} from "@/lib/validations/cart"
import type { getOrderLineItemsSchema } from "@/lib/validations/order"
import { ordersSearchParamsSchema } from "@/lib/validations/params"

export async function getOrderLineItems(
  input: z.infer<typeof getOrderLineItemsSchema> & {
    paymentIntent?: Stripe.Response<Stripe.PaymentIntent> | null
  }
): Promise<CartLineItemSchema[]> {
  try {
    const safeParsedItems = z
      .array(checkoutItemSchema)
      .safeParse(JSON.parse(input.items ?? "[]"))

    if (!safeParsedItems.success) {
      throw new Error("Could not parse items.")
    }

    const productIds = [
      ...new Set(safeParsedItems.data.map((item) => item.productId)),
    ]

    const productRows = productIds.length
      ? await db
          .select({
            id: products.id,
            name: products.name,
            images: products.images,
            price: products.price,
            inventory: products.inventory,
            storeId: products.storeId,
            category: categories.name,
            subcategory: subcategories.name,
          })
          .from(products)
          .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(inArray(products.id, productIds))
          .execute()
      : []

    const productMap = new Map(productRows.map((p) => [p.id, p]))

    // Build one line per checkout item so each variant/SKU keeps its own
    // label, unit price and quantity (products with several variants would
    // otherwise collapse into a single row).
    const lineItems: CartLineItemSchema[] = safeParsedItems.data.map((item) => {
      const product = productMap.get(item.productId)

      return {
        id: item.productId,
        name: product?.name ?? "",
        images: product?.images ?? null,
        category: product?.category ?? null,
        subcategory: product?.subcategory ?? null,
        price: item.price ? String(item.price) : (product?.price ?? "0"),
        inventory: product?.inventory ?? 0,
        quantity: item.quantity,
        variant: item.variant ?? null,
        skuId: item.skuId ?? null,
        storeId: product?.storeId ?? STORE_ID,
        storeName: null,
        storeStripeAccountId: null,
      }
    })

    // Single-store fallback: create the order as soon as the customer lands on
    // the success page with a succeeded PaymentIntent. This complements the
    // Stripe webhook (which may not reach localhost during development) and is
    // idempotent, so it never duplicates an order already created elsewhere.
    if (input.paymentIntent?.status === "succeeded") {
      const paymentIntentId = input.paymentIntent.id

      // Idempotency guard: bail out if this payment already produced an order.
      const existingOrder = await db.query.orders.findFirst({
        columns: { id: true },
        where: eq(orders.stripePaymentIntentId, paymentIntentId),
      })

      if (existingOrder) {
        return lineItems
      }

      const cartId = String(cookies().get("cartId")?.value)

      const cart = await db.query.carts.findFirst({
        columns: {
          closed: true,
          paymentIntentId: true,
          clientSecret: true,
        },
        where: eq(carts.id, cartId),
      })

      const storeId = input.storeId || STORE_ID
      const customerEmail = input.paymentIntent.receipt_email ?? ""
      const customerName = input.paymentIntent.shipping?.name ?? ""
      const userId = input.paymentIntent.metadata?.userId || null

      // Create new address in DB
      const stripeAddress = input.paymentIntent.shipping?.address

      const newAddress = await db
        .insert(addresses)
        .values({
          line1: stripeAddress?.line1,
          line2: stripeAddress?.line2,
          city: stripeAddress?.city,
          state: stripeAddress?.state,
          country: stripeAddress?.country,
          postalCode: stripeAddress?.postal_code,
        })
        .returning({ insertedId: addresses.id })

      if (!newAddress[0]?.insertedId) throw new Error("No address created.")

      // Create new order in db
      await db.insert(orders).values({
        storeId,
        userId,
        items: input.items as unknown as CheckoutItemSchema[],
        quantity: safeParsedItems.data.reduce(
          (acc, item) => acc + item.quantity,
          0
        ),
        amount: String(Number(input.paymentIntent.amount) / 100),
        stripePaymentIntentId: paymentIntentId,
        stripePaymentIntentStatus: input.paymentIntent.status,
        name: customerName,
        email: customerEmail,
        addressId: newAddress[0].insertedId,
      })

      // Update product inventory (and per-variant stock when applicable)
      for (const item of safeParsedItems.data) {
        const product = await db.query.products.findFirst({
          columns: {
            id: true,
            inventory: true,
          },
          where: eq(products.id, item.productId),
        })

        if (!product) continue

        await db
          .update(products)
          .set({
            inventory: Math.max(product.inventory - item.quantity, 0),
          })
          .where(eq(products.id, item.productId))

        // Decrement the selected combination's (SKU) inventory when present.
        if (item.skuId) {
          await db
            .update(productSkus)
            .set({
              inventory: sql`GREATEST(${productSkus.inventory} - ${item.quantity}, 0)`,
            })
            .where(eq(productSkus.id, item.skuId))
        }
      }

      // Close the cart that initiated this payment, if any.
      if (cart?.paymentIntentId) {
        await db
          .update(carts)
          .set({
            closed: true,
            items: [],
          })
          .where(eq(carts.paymentIntentId, cart.paymentIntentId))
      }
    }

    return lineItems
  } catch (err) {
    return []
  }
}

export async function getStoreOrders(input: {
  storeId: string
  searchParams: SearchParams
}) {
  noStore()
  try {
    const { page, per_page, sort, customer, status, from, to } =
      ordersSearchParamsSchema.parse(input.searchParams)

    // Fallback page for invalid page numbers
    const fallbackPage = isNaN(page) || page < 1 ? 1 : page
    // Number of items per page
    const limit = isNaN(per_page) ? 10 : per_page
    // Number of items to skip
    const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
    // Column and order to sort by
    const [column, order] = (sort.split(".") as [
      keyof Order | undefined,
      "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"]

    const statuses = status ? status.split(".") : []

    const fromDay = from ? new Date(from) : undefined
    const toDay = to ? new Date(to) : undefined

    // Transaction is used to ensure both queries are executed in a single transaction
    return await db.transaction(async (tx) => {
      const data = await tx
        .select({
          id: orders.id,
          storeId: orders.storeId,
          quantity: orders.quantity,
          amount: orders.amount,
          paymentIntentId: orders.stripePaymentIntentId,
          status: orders.stripePaymentIntentStatus,
          customer: orders.email,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .limit(limit)
        .offset(offset)
        .where(
          and(
            eq(orders.storeId, input.storeId),
            // Filter by email
            customer ? like(orders.email, `%${customer}%`) : undefined,
            // Filter by status
            statuses.length > 0
              ? inArray(orders.stripePaymentIntentStatus, statuses)
              : undefined,
            // Filter by createdAt
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .orderBy(
          column && column in orders
            ? order === "asc"
              ? asc(orders[column])
              : desc(orders[column])
            : desc(orders.createdAt)
        )

      const count = await tx
        .select({
          count: sql`count(*)`.mapWith(Number),
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, input.storeId),
            // Filter by email
            customer ? like(orders.email, `%${customer}%`) : undefined,
            // Filter by status
            statuses.length > 0
              ? inArray(orders.stripePaymentIntentStatus, statuses)
              : undefined,
            // Filter by createdAt
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0)

      const pageCount = Math.ceil(count / limit)

      return {
        data,
        pageCount,
      }
    })
  } catch (err) {
    console.error(err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getOrderCount(input: {
  storeId: string
  fromDay?: Date
  toDay?: Date
}) {
  noStore()
  try {
    const { storeId, fromDay, toDay } = input

    return await db
      .select({
        count: sql`count(*)`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          fromDay && toDay
            ? and(gte(orders.createdAt, fromDay), lte(orders.createdAt, toDay))
            : undefined
        )
      )
      .execute()
      .then((res) => res[0]?.count ?? 0)
  } catch (err) {
    return 0
  }
}

export async function getSaleCount(input: {
  storeId: string
  fromDay?: Date
  toDay?: Date
}) {
  noStore()
  try {
    const { storeId, fromDay, toDay } = input

    const storeOrders = await db
      .select({
        amount: orders.amount,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          fromDay && toDay
            ? and(gte(orders.createdAt, fromDay), lte(orders.createdAt, toDay))
            : undefined
        )
      )

    const sales = storeOrders.reduce(
      (acc, order) => acc + Number(order.amount),
      0
    )

    return sales
  } catch (err) {
    return 0
  }
}

export async function getSales(input: {
  storeId: string
  fromDay?: Date
  toDay?: Date
}) {
  noStore()
  try {
    const { storeId, fromDay, toDay } = input

    return await db
      .select({
        year: sql`EXTRACT(YEAR FROM ${orders.createdAt})`.mapWith(Number),
        month: sql`EXTRACT(MONTH FROM ${orders.createdAt})`.mapWith(Number),
        totalSales: sql`SUM(${orders.amount})`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          fromDay && toDay
            ? and(gte(orders.createdAt, fromDay), lte(orders.createdAt, toDay))
            : undefined
        )
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
        sql`EXTRACT(MONTH FROM ${orders.createdAt})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
        sql`EXTRACT(MONTH FROM ${orders.createdAt})`
      )
      .execute()
  } catch (err) {
    return []
  }
}

export async function getCustomers(input: {
  storeId: string
  limit: number
  offset: number
  fromDay?: Date
  toDay?: Date
}) {
  noStore()
  try {
    const transaction = await db.transaction(async (tx) => {
      const { storeId, limit, offset, fromDay, toDay } = input

      const customers = await tx
        .select({
          email: orders.email,
          name: orders.name,
          totalSpent: sql<number>`sum(${orders.amount})`,
        })
        .from(orders)
        .limit(limit)
        .offset(offset)
        .where(
          and(
            eq(orders.storeId, storeId),
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .groupBy(orders.email, orders.name, orders.createdAt)
        .orderBy(desc(orders.createdAt))

      const customerCount = await tx
        .select({
          count: countDistinct(orders.email),
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, storeId),
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return {
        customers,
        customerCount,
      }
    })

    return transaction
  } catch (err) {
    return {
      customers: [],
      customerCount: 0,
    }
  }
}
