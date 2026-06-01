/**
 * End-to-end checkout test (Stripe test mode):
 * 1. Load the latest open cart with items
 * 2. Create + confirm a PaymentIntent with pm_card_visa
 * 3. POST payment_intent.succeeded to the local webhook
 * 4. Verify an order was created
 */
import { env } from "@/env.js"
import { db } from "@/db"
import { carts, orders, products } from "@/db/schema"
import { desc, eq, inArray } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { calculateOrderAmount } from "@/lib/checkout"
import { stripe } from "@/lib/stripe"
import type { CheckoutItemSchema } from "@/lib/validations/cart"

async function main() {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.closed, false),
    orderBy: desc(carts.createdAt),
  })

  if (!cart?.items?.length) {
    throw new Error("No open cart with items found. Add something to the cart first.")
  }

  const productIds = [...new Set(cart.items.map((i) => i.productId))]
  const productRows = await db
    .select({ id: products.id, price: products.price })
    .from(products)
    .where(inArray(products.id, productIds))

  const priceById = new Map(productRows.map((p) => [p.id, p.price]))

  const checkoutItems: CheckoutItemSchema[] = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    variant: item.variant,
    skuId: item.skuId,
    price: item.price ?? Number(priceById.get(item.productId) ?? 0),
  }))

  const lineItems = checkoutItems.map((item) => ({
    id: item.productId,
    name: "Test item",
    price: String(item.price),
    quantity: item.quantity,
    variant: item.variant ?? null,
    skuId: item.skuId ?? null,
    inventory: 99,
    storeId: STORE_ID,
  }))

  const { total } = calculateOrderAmount(lineItems)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd",
    metadata: {
      cartId: cart.id,
      storeId: STORE_ID,
      userId: "test_user",
      items: JSON.stringify(checkoutItems),
    },
    receipt_email: "test@biomstep.com",
    shipping: {
      name: "Test Customer",
      address: {
        line1: "123 Test St",
        city: "Madrid",
        country: "ES",
        postal_code: "28001",
      },
    },
  })

  const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
    payment_method: "pm_card_visa",
    return_url: "http://localhost:3000/checkout/str_default00000/success",
  })

  if (confirmed.status !== "succeeded") {
    throw new Error(`Payment not succeeded: ${confirmed.status}`)
  }

  console.log("PaymentIntent succeeded:", confirmed.id)

  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}`,
    object: "event",
    type: "payment_intent.succeeded",
    data: { object: confirmed },
  })

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  })

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": signature,
    },
    body: payload,
  })

  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status} ${await res.text()}`)
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.stripePaymentIntentId, confirmed.id),
  })

  if (!order) {
    throw new Error("Order was not created after webhook.")
  }

  console.log("Order created:", order.id, "amount:", order.amount)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
