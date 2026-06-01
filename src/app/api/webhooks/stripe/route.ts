import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { db } from "@/db"
import {
  addresses,
  carts,
  orders,
  products,
  productSkus,
} from "@/db/schema"
import { env } from "@/env.js"
import { clerkClient } from "@clerk/nextjs/server"
import { eq, inArray, sql } from "drizzle-orm"
import type Stripe from "stripe"
import { z } from "zod"

import { stripe } from "@/lib/stripe"
import {
  checkoutItemSchema,
  type CheckoutItemSchema,
} from "@/lib/validations/cart"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") ?? ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error."}`,
      { status: 400 }
    )
  }

  switch (event.type) {
    // Handling subscription events
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object

      // If there is a user id, and no cart id in the metadata, then this is a new subscription
      if (
        checkoutSessionCompleted?.metadata?.userId &&
        !checkoutSessionCompleted?.metadata?.cartId
      ) {
        // Retrieve the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSessionCompleted.subscription as string
        )

        // Update the user stripe into in our database.
        // Since this is the initial subscription, we need to update
        // the subscription id and customer id.
        await clerkClient.users.updateUserMetadata(
          checkoutSessionCompleted?.metadata?.userId,
          {
            privateMetadata: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          }
        )
      }
      break
    case "invoice.payment_succeeded":
      const invoicePaymentSucceeded = event.data.object

      // If there is a user id, and no cart id in the metadata, then this is a new subscription
      if (
        invoicePaymentSucceeded?.metadata?.userId &&
        !invoicePaymentSucceeded?.metadata?.cartId
      ) {
        // Retrieve the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          invoicePaymentSucceeded.subscription as string
        )

        // Update the price id and set the new period end
        await clerkClient.users.updateUserMetadata(
          invoicePaymentSucceeded?.metadata?.userId,
          {
            privateMetadata: {
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          }
        )
      }
      revalidateTag(`${invoicePaymentSucceeded?.metadata?.userId}-subscription`)
      break

    // Handling payment events
    case "payment_intent.payment_failed":
      const paymentIntentPaymentFailed = event.data.object
      console.log(
        `❌ Payment failed: ${paymentIntentPaymentFailed.last_payment_error?.message}`
      )
      break
    case "payment_intent.processing":
      const paymentIntentProcessing = event.data.object
      console.log(`⏳ Payment processing: ${paymentIntentProcessing.id}`)
      break
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object

      const paymentIntentId = paymentIntentSucceeded?.id
      const orderAmount = paymentIntentSucceeded?.amount
      const checkoutItems = paymentIntentSucceeded?.metadata
        ?.items as unknown as CheckoutItemSchema[]

      // If there are items in metadata, then create order
      if (checkoutItems) {
        try {
          // Parsing items from metadata
          // Didn't parse before because can pass the unparsed data directly to the order table items json column in the db
          const safeParsedItems = z
            .array(checkoutItemSchema)
            .safeParse(
              JSON.parse(paymentIntentSucceeded?.metadata?.items ?? "[]")
            )

          if (!safeParsedItems.success) {
            throw new Error("Could not parse items.")
          }

          // Single-store e-commerce: the store is resolved from metadata set at
          // checkout time (no Stripe Connect / connected account).
          const storeId = paymentIntentSucceeded?.metadata?.storeId

          if (!storeId) {
            return new Response("Store not found.", { status: 404 })
          }

          // Create new address in DB
          const stripeAddress = paymentIntentSucceeded?.shipping?.address

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
            .returning({
              insertedId: addresses.id,
            })

          if (!newAddress[0]?.insertedId) throw new Error("No address created.")

          const customerEmail = paymentIntentSucceeded?.receipt_email ?? ""
          const customerName = paymentIntentSucceeded?.shipping?.name ?? ""
          const userId = paymentIntentSucceeded?.metadata?.userId || null

          // Create new order in db
          const newOrder = await db
            .insert(orders)
            .values({
              storeId,
              userId,
              items: checkoutItems ?? [],
              quantity: safeParsedItems.data.reduce(
                (acc, item) => acc + item.quantity,
                0
              ),
              amount: String(Number(orderAmount) / 100),
              stripePaymentIntentId: paymentIntentId,
              stripePaymentIntentStatus: paymentIntentSucceeded?.status,
              name: customerName,
              email: customerEmail,
              addressId: newAddress[0]?.insertedId,
            })
            .returning({ insertedId: orders.id })

          const orderId = newOrder[0]?.insertedId

          // Update product inventory in db
          for (const item of safeParsedItems.data) {
            const product = await db.query.products.findFirst({
              columns: {
                id: true,
                inventory: true,
              },
              where: eq(products.id, item.productId),
            })

            if (!product) {
              throw new Error("Product not found.")
            }

            const inventory = product.inventory - item.quantity

            if (inventory < 0) {
              throw new Error("Product out of stock.")
            }

            await db
              .update(products)
              .set({
                inventory: product.inventory - item.quantity,
              })
              .where(eq(products.id, item.productId))

            // If the line selected a concrete combination (SKU), also decrement
            // that SKU's inventory.
            if (item.skuId) {
              await db
                .update(productSkus)
                .set({
                  inventory: sql`GREATEST(${productSkus.inventory} - ${item.quantity}, 0)`,
                })
                .where(eq(productSkus.id, item.skuId))
            }
          }

          // Generate a hosted Stripe invoice for the completed order.
          // Failures here must not block order creation, so we isolate them.
          if (orderId && customerEmail) {
            try {
              const invoice = await createInvoiceForOrder({
                email: customerEmail,
                name: customerName,
                items: safeParsedItems.data,
                orderId,
              })

              if (invoice) {
                await db
                  .update(orders)
                  .set({
                    stripeInvoiceId: invoice.id,
                    stripeInvoiceUrl: invoice.hosted_invoice_url ?? null,
                  })
                  .where(eq(orders.id, orderId))
              }
            } catch (invoiceErr) {
              console.log("Error creating invoice.", invoiceErr)
            }
          }

          // Close cart and clear items
          await db
            .update(carts)
            .set({
              closed: true,
              items: [],
            })
            .where(eq(carts.paymentIntentId, paymentIntentId))
        } catch (err) {
          console.log("Error creating order.", err)
        }
      }
      break
    case "application_fee.created":
      const applicationFeeCreated = event.data.object
      console.log(`Application fee id: ${applicationFeeCreated.id}`)
      break
    case "charge.succeeded":
      const chargeSucceeded = event.data.object
      console.log(`Charge id: ${chargeSucceeded.id}`)
      break
    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return new Response(null, { status: 200 })
}

/**
 * Generates a finalized, hosted Stripe invoice for an order that was already
 * paid via a PaymentIntent (single-store e-commerce, no Connect). The invoice
 * is marked as paid out of band since funds were collected at checkout.
 */
async function createInvoiceForOrder({
  email,
  name,
  items,
  orderId,
}: {
  email: string
  name: string
  items: CheckoutItemSchema[]
  orderId: string
}) {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  })

  const productIds = items.map((item) => item.productId)
  const productRows = productIds.length
    ? await db.query.products.findMany({
        columns: { id: true, name: true },
        where: inArray(products.id, productIds),
      })
    : []
  const productNameById = new Map(productRows.map((p) => [p.id, p.name]))

  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: Math.round(item.price * item.quantity * 100),
      currency: "usd",
      description: `${item.quantity} × ${
        productNameById.get(item.productId) ?? "Product"
      }`,
    })
  }

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    auto_advance: false,
    collection_method: "send_invoice",
    days_until_due: 0,
    metadata: { orderId },
  })

  if (!invoice.id) return null

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id)

  if (!finalized.id) return finalized

  return stripe.invoices.pay(finalized.id, { paid_out_of_band: true })
}
