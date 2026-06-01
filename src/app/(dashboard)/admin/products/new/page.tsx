import type { Metadata } from "next"
import { env } from "@/env.js"

import { STORE_ID } from "@/config/store"
import { getCategories, getSubcategories } from "@/lib/queries/product"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateProductForm } from "@/components/forms/create-product-form"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "New Product",
  description: "Add a new product",
}

export default async function NewProductPage() {
  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories })
  )

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Add product</CardTitle>
        <CardDescription>Add a new product to your store</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateProductForm storeId={STORE_ID} promises={promises} />
      </CardContent>
    </Card>
  )
}
