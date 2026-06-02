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
      className="relative pt-10 pb-16 md:pt-14 md:pb-20 lg:pb-24"
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
      <div className="mt-12 grid grid-cols-1 gap-5 xs:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="group/card overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-[0_24px_50px_-20px_rgba(13,148,136,0.25)] dark:hover:shadow-[0_24px_50px_-20px_rgba(13,148,136,0.4)]"
          />
        ))}
      </div>
      <div className="mt-10 flex justify-center sm:hidden">
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
