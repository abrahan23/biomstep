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
        sectionNumber="02"
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
            className="overflow-hidden rounded-xl border border-border/60 bg-card transition-colors duration-300 hover:border-teal-500/25"
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center sm:hidden">
        <Button
          variant="ghost"
          className="rounded-full text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/40"
          asChild
        >
          <Link href={sections.bestSellers.href}>
            {sections.bestSellers.linkText}
            <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
