import {
  type getBestSellingProducts,
  type getCategories,
} from "@/lib/queries/product"
import { Shell } from "@/components/shell"

import { HomeBenefits } from "./home-benefits"
import { HomeBestSellers } from "./home-best-sellers"
import { HomeCategories } from "./home-categories"
import { HomeFaq } from "./home-faq"
import { HomeHero } from "./home-hero"
import { HomeTestimonials } from "./home-testimonials"

interface LobbyProps {
  heroVideoUrl?: string
  bestSellingPromise: ReturnType<typeof getBestSellingProducts>
  categoriesPromise: ReturnType<typeof getCategories>
}

export async function Lobby({
  heroVideoUrl,
  bestSellingPromise,
  categoriesPromise,
}: LobbyProps) {
  const [bestSellingProducts, categories] = await Promise.all([
    bestSellingPromise,
    categoriesPromise,
  ])

  return (
    <>
      <HomeHero videoUrl={heroVideoUrl} />
      <div className="relative z-10 bg-background">
        <Shell className="max-w-6xl gap-0">
          <HomeCategories categories={categories} />
          <HomeBestSellers products={bestSellingProducts} />
          <HomeBenefits />
          <HomeTestimonials />
          <HomeFaq />
        </Shell>
      </div>
    </>
  )
}
