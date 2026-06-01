import { type Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { addresses, orders } from "@/db/schema"
import { env } from "@/env.js"
import { and, eq } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { getOrderLineItems } from "@/lib/actions/order"
import { cn, formatId, formatPrice } from "@/lib/utils"
import { OrderShippingAddress } from "@/components/account/order-shipping-address"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Order",
  description: "View order details",
}

interface OrderPageProps {
  params: {
    orderId: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const orderId = decodeURIComponent(params.orderId)

  const orderRow = await db
    .select({
      order: orders,
      address: {
        line1: addresses.line1,
        line2: addresses.line2,
        city: addresses.city,
        state: addresses.state,
        postalCode: addresses.postalCode,
        country: addresses.country,
      },
    })
    .from(orders)
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(and(eq(orders.id, orderId), eq(orders.storeId, STORE_ID)))
    .then((rows) => rows[0])

  if (!orderRow) {
    notFound()
  }

  const order = orderRow.order

  const orderLineItems = await getOrderLineItems({
    items: String(order.items),
    storeId: order.storeId,
  })

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle as="h2" className="text-2xl">
          Order {formatId(order.id)}
        </CardTitle>
        <CardDescription>
          {order.name} · {order.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full flex-col space-y-6">
        <OrderShippingAddress
          name={order.name}
          email={order.email}
          address={orderRow.address}
          labels={{
            title: "Shipping address",
            recipient: "Recipient",
            noAddress: "No shipping address on file.",
          }}
        />
        {orderLineItems.map((item) => (
          <Link
            aria-label={`View ${item.name}`}
            key={`${item.id}-${item.variant ?? ""}`}
            href={`/product/${item.id}`}
            className="rounded-md bg-muted px-4 py-2.5 hover:bg-muted/70"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col space-y-1 self-start">
                  <span className="line-clamp-1 text-sm font-medium">
                    {item.name}
                  </span>
                  {item.variant ? (
                    <span className="line-clamp-1 text-xs font-medium text-muted-foreground">
                      {item.variant}
                    </span>
                  ) : null}
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    Qty {item.quantity}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-1 font-medium">
                <span className="ml-auto line-clamp-1 text-sm">
                  {formatPrice((Number(item.price) * item.quantity).toFixed(2))}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {formatPrice(item.price)} each
                </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">Total {formatPrice(order.amount)}</span>
        {order.stripeInvoiceUrl ? (
          <Link
            href={order.stripeInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            View invoice
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  )
}
