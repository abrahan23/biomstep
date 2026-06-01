import { type Metadata } from "next"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { env } from "@/env.js"
import { desc, eq, or } from "drizzle-orm"

import { getCachedUser } from "@/lib/queries/user"
import { cn, formatDate, formatId, formatPrice, getUserEmail } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "My account",
  description: "View your orders and invoices",
}

export default async function AccountPage() {
  noStore()

  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const email = getUserEmail(user)

  const data = await db
    .select({
      id: orders.id,
      amount: orders.amount,
      quantity: orders.quantity,
      status: orders.stripePaymentIntentStatus,
      createdAt: orders.createdAt,
      invoiceUrl: orders.stripeInvoiceUrl,
    })
    .from(orders)
    .where(or(eq(orders.userId, user.id), eq(orders.email, email)))
    .orderBy(desc(orders.createdAt))

  return (
    <Shell variant="sidebar">
      <PageHeader>
        <PageHeaderHeading size="sm">My orders</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          View your orders and download invoices
        </PageHeaderDescription>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data.length} order{data.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>Your purchase history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            data.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    Order {formatId(order.id)}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.quantity ?? 0} item
                    {order.quantity === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {order.status}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatPrice(order.amount)}
                  </span>
                  {order.invoiceUrl ? (
                    <Link
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Invoice
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </Shell>
  )
}
