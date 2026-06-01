import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { products } from "@/db/schema"
import { env } from "@/env.js"
import { and, eq } from "drizzle-orm"

import { STORE_ID } from "@/config/store"
import { getProductVariantData } from "@/lib/actions/variant"
import { getCategories, getSubcategories } from "@/lib/queries/product"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductVariants } from "@/components/forms/product-variants"
import { UpdateProductForm } from "@/components/forms/update-product-form"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Manage Product",
  description: "Manage your product",
}

interface UpdateProductPageProps {
  params: {
    productId: string
  }
}

export default async function UpdateProductPage({
  params,
}: UpdateProductPageProps) {
  const productId = decodeURIComponent(params.productId)

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, STORE_ID)),
  })

  if (!product) {
    notFound()
  }

  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories })
  )

  const { options, skus } = await getProductVariantData(productId)

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle as="h2" className="text-2xl">
            Update product
          </CardTitle>
          <CardDescription>
            Update your product information, or delete it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProductForm promises={promises} product={product} />
        </CardContent>
      </Card>
      <ProductVariants productId={productId} options={options} skus={skus} />
    </div>
  )
}
