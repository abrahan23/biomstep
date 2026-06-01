import * as React from "react"
import { type Metadata } from "next"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { categories, products, type Product } from "@/db/schema"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { getCategories } from "@/lib/queries/product"
import { cn } from "@/lib/utils"
import { storesProductsSearchParamsSchema } from "@/lib/validations/params"
import { buttonVariants } from "@/components/ui/button"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { ProductsTable } from "@/components/tables/products-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Products",
  description: "Manage your products",
}

interface AdminProductsPageProps {
  searchParams: SearchParams
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const storeId = STORE_ID

  const { page, per_page, sort, name, category, from, to } =
    storesProductsSearchParamsSchema.parse(searchParams)

  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  const limit = isNaN(per_page) ? 10 : per_page
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
  const [column, order] = (sort?.split(".") as [
    keyof Product | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["createdAt", "desc"]

  const categoryIds = category?.split(".") ?? []
  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  const productsPromise = db.transaction(async (tx) => {
    noStore()
    try {
      const where = and(
        eq(products.storeId, storeId),
        name ? ilike(products.name, `%${name}%`) : undefined,
        categoryIds.length > 0
          ? inArray(products.categoryId, categoryIds)
          : undefined,
        fromDay && toDay
          ? and(gte(products.createdAt, fromDay), lte(products.createdAt, toDay))
          : undefined
      )

      const data = await tx
        .select({
          id: products.id,
          name: products.name,
          categoryId: products.categoryId,
          price: products.price,
          inventory: products.inventory,
          rating: products.rating,
          createdAt: products.createdAt,
        })
        .from(products)
        .limit(limit)
        .offset(offset)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(
          column && column in products
            ? order === "asc"
              ? asc(products[column])
              : desc(products[column])
            : desc(products.createdAt)
        )

      const count = await tx
        .select({ count: sql<number>`count(${products.id})` })
        .from(products)
        .where(where)
        .then((res) => res[0]?.count ?? 0)

      return { data, pageCount: Math.ceil(count / limit) }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0 }
    }
  })

  const categoriesPromise = getCategories()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center gap-2">
          <DateRangePicker align="end" />
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            New product
          </Link>
        </div>
      </div>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <ProductsTable
          promise={productsPromise}
          categoriesPromise={categoriesPromise}
          storeId={storeId}
        />
      </React.Suspense>
    </div>
  )
}
