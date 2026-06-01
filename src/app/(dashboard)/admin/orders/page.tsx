import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { orders, type Order } from "@/db/schema"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { and, asc, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { ordersSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { OrdersTable } from "@/components/tables/orders-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Orders",
  description: "Manage your orders",
}

interface AdminOrdersPageProps {
  searchParams: SearchParams
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const storeId = STORE_ID

  const { page, per_page, sort, customer, status, from, to } =
    ordersSearchParamsSchema.parse(searchParams)

  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  const limit = isNaN(per_page) ? 10 : per_page
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
  const [column, order] = (sort.split(".") as [
    keyof Order | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["createdAt", "desc"]

  const statuses = status ? status.split(".") : []
  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  noStore()
  const ordersPromise = db.transaction(async (tx) => {
    try {
      const where = and(
        eq(orders.storeId, storeId),
        customer ? like(orders.email, `%${customer}%`) : undefined,
        statuses.length > 0
          ? inArray(orders.stripePaymentIntentStatus, statuses)
          : undefined,
        fromDay && toDay
          ? and(gte(orders.createdAt, fromDay), lte(orders.createdAt, toDay))
          : undefined
      )

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
        .where(where)
        .orderBy(
          column && column in orders
            ? order === "asc"
              ? asc(orders[column])
              : desc(orders[column])
            : desc(orders.createdAt)
        )

      const count = await tx
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(where)
        .then((res) => res[0]?.count ?? 0)

      return { data, pageCount: Math.ceil(count / limit) }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0 }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <OrdersTable promise={ordersPromise} storeId={storeId} />
      </React.Suspense>
    </div>
  )
}
