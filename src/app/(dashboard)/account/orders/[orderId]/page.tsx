import { type Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { env } from "@/env.js"
import { and, eq, or } from "drizzle-orm"

import { getOrderLineItems } from "@/lib/actions/order"
import { getCachedUser } from "@/lib/queries/user"
import { cn, formatId, formatPrice, getUserEmail } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Order",
  description: "View your order details",
}

interface AccountOrderPageProps {
  params: {
    orderId: string
  }
}

export default async function AccountOrderPage({
  params,
}: AccountOrderPageProps) {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const orderId = decodeURIComponent(params.orderId)
  const email = getUserEmail(user)

  // Customers can only view their own orders (matched by user id or email).
  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      or(eq(orders.userId, user.id), eq(orders.email, email))
    ),
  })

  if (!order) {
    notFound()
  }

  const orderLineItems = await getOrderLineItems({
    items: String(order.items),
    storeId: order.storeId,
  })

  return (
    <Shell variant="sidebar">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle as="h2" className="text-2xl">
            Order {formatId(order.id)}
          </CardTitle>
          <CardDescription>View your order details</CardDescription>
        </CardHeader>
        <CardContent className="flex w-full flex-col space-y-2.5">
          {orderLineItems.map((item) => (
            <Link
              aria-label={`View ${item.name}`}
              key={`${item.id}-${item.variant ?? ""}`}
              href={`/product/${item.id}`}
              className="rounded-md bg-muted px-4 py-2.5 hover:bg-muted/70"
            >
              <div className="flex items-start justify-between gap-4">
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
                <span className="line-clamp-1 text-sm font-medium">
                  {formatPrice((Number(item.price) * item.quantity).toFixed(2))}
                </span>
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
    </Shell>
  )
}
