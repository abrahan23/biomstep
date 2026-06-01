import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { EmptyCard } from "@/components/empty-card"

interface ProductsEmptyStateProps {
  collectionName: string
  hasActiveFilters?: boolean
  parentCategoryHref?: string
  parentCategoryName?: string
}

export function ProductsEmptyState({
  collectionName,
  hasActiveFilters = false,
  parentCategoryHref,
  parentCategoryName,
}: ProductsEmptyStateProps) {
  const title = hasActiveFilters
    ? "Ningún producto coincide con los filtros"
    : `No hay productos en ${collectionName}`

  const description = hasActiveFilters
    ? "Prueba a cambiar el rango de precio o limpiar los filtros."
    : "Estamos preparando novedades para esta colección. Vuelve pronto."

  return (
    <EmptyCard
      title={title}
      description={description}
      icon="product"
      className="w-full"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {hasActiveFilters ? (
          <Link href="." className={buttonVariants({ variant: "outline", size: "sm" })}>
            Limpiar filtros
          </Link>
        ) : null}
        {parentCategoryHref && parentCategoryName ? (
          <Link
            href={parentCategoryHref}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Ver {parentCategoryName}
          </Link>
        ) : null}
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Ir al inicio
        </Link>
      </div>
    </EmptyCard>
  )
}
