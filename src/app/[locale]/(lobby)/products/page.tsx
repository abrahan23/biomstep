import { type Metadata } from "next"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import { getCategories, getProducts } from "@/lib/queries/product"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Productos",
  description: "Explora el catálogo completo de BIOMSTEP",
}

interface ProductsPageProps {
  searchParams: SearchParams
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const [productsTransaction, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Catálogo</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Explora todos los productos BIOMSTEP
        </PageHeaderDescription>
      </PageHeader>
      <Products
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
        categories={categories.map((c) => c.name)}
      />
    </Shell>
  )
}
