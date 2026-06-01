import { getTranslations } from "next-intl/server"

import { homeConfig } from "@/config/home"
import { type getBestSellingProducts } from "@/lib/queries/product"
import { ProductCard } from "@/components/product-card"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { HomeSectionHeader } from "./home-section-header"

interface HomeBestSellersProps {
  products: Awaited<ReturnType<typeof getBestSellingProducts>>
}

export async function HomeBestSellers({ products }: HomeBestSellersProps) {
  const t = await getTranslations("Home.sections.bestSellers")
  const { href } = homeConfig.sections.bestSellers

  if (products.length === 0) return null

  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      aria-labelledby="home-bestsellers-title"
    >
      <HomeSectionHeader
        sectionNumber="02"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        href={href}
        linkText={t("linkText")}
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
          <Link href={href}>
            {t("linkText")}
            <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
