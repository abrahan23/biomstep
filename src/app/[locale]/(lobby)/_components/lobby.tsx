import {
  type getBestSellingProducts,
  type getCategories,
} from "@/lib/queries/product"
import { Shell } from "@/components/shell"

import { HomeBenefits } from "./home-benefits"
import { HomeBestSellers } from "./home-best-sellers"
import { HomeBestSellersMotion } from "./home-best-sellers-motion"
import { HomeCategoriesReveal } from "./home-categories-reveal"
import { HomeFaq } from "./home-faq"
import { HomeIntroScroll } from "./home-intro-scroll"
import { HomeTestimonials } from "./home-testimonials"

interface LobbyProps {
  bestSellingPromise: ReturnType<typeof getBestSellingProducts>
  categoriesPromise: ReturnType<typeof getCategories>
}

export async function Lobby({
  bestSellingPromise,
  categoriesPromise,
}: LobbyProps) {
  const [bestSellingProducts, categories] = await Promise.all([
    bestSellingPromise,
    categoriesPromise,
  ])

  return (
    <>
      <HomeIntroScroll
        categoriesReveal={<HomeCategoriesReveal categories={categories} />}
      />
      <div className="relative z-10 bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-[#070b12]/50 via-[#070b12]/15 to-background"
        />
        <Shell className="max-w-6xl gap-0 pt-0">
          <HomeBestSellersMotion>
            <HomeBestSellers products={bestSellingProducts} />
          </HomeBestSellersMotion>
          <HomeBenefits />
          <HomeTestimonials />
          <HomeFaq />
        </Shell>
      </div>
    </>
  )
}
