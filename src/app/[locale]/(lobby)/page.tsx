import * as React from "react"

import { type Locale } from "@/i18n/routing"
import { getBestSellingProducts, getCategories } from "@/lib/queries/product"
import { setRequestLocale } from "next-intl/server"

import { Lobby } from "./_components/lobby"
import { LobbySkeleton } from "./_components/lobby-skeleton"

interface IndexPageProps {
  params: { locale: Locale }
}

export default async function IndexPage({ params: { locale } }: IndexPageProps) {
  setRequestLocale(locale)

  const bestSellingPromise = getBestSellingProducts()
  const categoriesPromise = getCategories()

  return (
    <React.Suspense fallback={<LobbySkeleton />}>
      <Lobby
        bestSellingPromise={bestSellingPromise}
        categoriesPromise={categoriesPromise}
      />
    </React.Suspense>
  )
}
