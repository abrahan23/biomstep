import type { Metadata } from "next"
import { env } from "@/env.js"

import { getAdminCatalog } from "@/lib/actions/category"
import { CatalogManager } from "@/app/(dashboard)/admin/_components/catalog-manager"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Categories",
  description: "Manage store categories and menu order",
}

export default async function AdminCategoriesPage() {
  const catalog = await getAdminCatalog()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Categorías y menú
        </h2>
        <p className="text-sm text-muted-foreground">
          Gestiona categorías, subcategorías y el orden del menú de la tienda.
        </p>
      </div>
      <CatalogManager catalog={catalog} />
    </div>
  )
}
