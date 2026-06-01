import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import {
  getCategoryBySlug,
  getProducts,
  getSubcategoriesByCategory,
  getSubcategoryBySlug,
} from "@/lib/queries/product"
import { toTitleCase } from "@/lib/utils"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

interface SubcategoryPageProps {
  params: {
    category: string
    subcategory: string
  }
  searchParams: SearchParams
}

export function generateMetadata({ params }: SubcategoryPageProps): Metadata {
  const subcategory = decodeURIComponent(params.subcategory)

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(subcategory),
    description: `Buy the best ${subcategory}`,
  }
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const categorySlug = decodeURIComponent(params.category)
  const subcategorySlug = decodeURIComponent(params.subcategory)

  const [category, subcategory] = await Promise.all([
    getCategoryBySlug({ slug: categorySlug }),
    getSubcategoryBySlug({ slug: subcategorySlug }),
  ])

  if (!category || !subcategory || subcategory.categoryId !== category.id) {
    notFound()
  }

  const productsTransaction = await getProducts({
    ...searchParams,
    categories: category.id,
    subcategories: subcategory.id,
  })

  const subcategories = await getSubcategoriesByCategory({
    categoryId: category.id,
  })

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          {toTitleCase(subcategory.name)}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {subcategory.description ?? `Buy the best ${subcategory.name}`}
        </PageHeaderDescription>
      </PageHeader>
      <Products
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
        collectionName={subcategory.name}
        parentCategoryHref={`/collections/${category.slug}`}
        parentCategoryName={category.name}
        category={category}
        subcategories={subcategories}
      />
    </Shell>
  )
}
