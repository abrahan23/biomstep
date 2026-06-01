import { type Metadata } from "next"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { env } from "@/env.js"
import { and, desc, eq, isNotNull } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { cn, formatDate, formatId, formatPrice } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Invoices",
  description: "View invoices generated for your orders",
}

export default async function AdminInvoicesPage() {
  noStore()

  const data = await db
    .select({
      id: orders.id,
      amount: orders.amount,
      email: orders.email,
      createdAt: orders.createdAt,
      invoiceUrl: orders.stripeInvoiceUrl,
    })
    .from(orders)
    .where(and(eq(orders.storeId, STORE_ID), isNotNull(orders.stripeInvoiceId)))
    .orderBy(desc(orders.createdAt))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data.length} invoice{data.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            data.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-4 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    Order {formatId(invoice.id)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {invoice.email} · {formatDate(invoice.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {formatPrice(invoice.amount)}
                  </span>
                  {invoice.invoiceUrl ? (
                    <Link
                      href={invoice.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      View
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
