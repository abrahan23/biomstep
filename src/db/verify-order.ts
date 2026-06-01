import { db } from "@/db"
import { carts, orders, productSkus } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

async function main() {
  const allOrders = await db.select().from(orders)
  console.log("Orders:", allOrders.length)
  for (const o of allOrders) {
    console.log({
      id: o.id,
      amount: o.amount,
      status: o.stripePaymentIntentStatus,
      email: o.email,
    })
  }

  const cart = await db.query.carts.findFirst({
    orderBy: desc(carts.createdAt),
  })
  console.log("Latest cart closed:", cart?.closed, "items:", cart?.items?.length ?? 0)

  const sku = await db.query.productSkus.findFirst({
    where: eq(productSkus.id, "PfBJWRZZeBfN"),
  })
  console.log("SKU inventory:", sku?.inventory)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
