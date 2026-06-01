import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { homeContent } from "@/config/home"
import { type getBestSellingProducts } from "@/lib/queries/product"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

import { HomeSectionHeader } from "./home-section-header"

interface HomeBestSellersProps {
  products: Awaited<ReturnType<typeof getBestSellingProducts>>
}

export function HomeBestSellers({ products }: HomeBestSellersProps) {
  const { sections } = homeContent

  if (products.length === 0) return null

  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      aria-labelledby="home-bestsellers-title"
    >
      <HomeSectionHeader
        eyebrow="Top ventas"
        title={sections.bestSellers.title}
        description={sections.bestSellers.description}
        href={sections.bestSellers.href}
        linkText={sections.bestSellers.linkText}
        titleId="home-bestsellers-title"
      />
      <div className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-border"
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center sm:hidden">
        <Button variant="ghost" className="rounded-full" asChild>
          <Link href={sections.bestSellers.href}>
            {sections.bestSellers.linkText}
            <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
