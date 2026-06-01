import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import {
  getCategoryBySlug,
  getProducts,
  getSubcategoriesByCategory,
} from "@/lib/queries/product"
import { toTitleCase } from "@/lib/utils"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: SearchParams
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = decodeURIComponent(params.category)

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(category),
    description: `Buy products from the ${category} category`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const slug = decodeURIComponent(params.category)

  const category = await getCategoryBySlug({ slug })

  if (!category) {
    notFound()
  }

  const subcategories = await getSubcategoriesByCategory({
    categoryId: category.id,
  })

  const productsTransaction = await getProducts({
    ...searchParams,
    categories: category.id,
  })

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          {toTitleCase(category.name)}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {category.description ?? `Buy the best ${category.name}`}
        </PageHeaderDescription>
      </PageHeader>
      <Products
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
        collectionName={category.name}
        category={category}
        subcategories={subcategories}
      />
    </Shell>
  )
}
