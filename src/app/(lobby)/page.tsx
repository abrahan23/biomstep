import * as React from "react"

import { homeContent } from "@/config/home"
import { env } from "@/env.js"
import { getBestSellingProducts, getCategories } from "@/lib/queries/product"

import { Lobby } from "./_components/lobby"
import { LobbySkeleton } from "./_components/lobby-skeleton"

export default async function IndexPage() {
  const heroVideoUrl =
    env.NEXT_PUBLIC_HERO_VIDEO_URL ?? homeContent.hero.videoSrc
  const bestSellingPromise = getBestSellingProducts()
  const categoriesPromise = getCategories()

  return (
    <React.Suspense fallback={<LobbySkeleton />}>
      <Lobby
        heroVideoUrl={heroVideoUrl}
        bestSellingPromise={bestSellingPromise}
        categoriesPromise={categoriesPromise}
      />
    </React.Suspense>
  )
}
