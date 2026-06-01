import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { env } from "@/env.js"

import { getUniqueStoreIds } from "@/lib/actions/cart"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { CheckoutCard } from "@/components/checkout/checkout-card"
import { Icons } from "@/components/icons"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart")

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: t("pageMetadataTitle"),
    description: t("pageMetadataDescription"),
  }
}

export default async function CartPage() {
  const t = await getTranslations("Cart")
  const uniqueStoreIds = await getUniqueStoreIds()

  return (
    <Shell>
      <PageHeader
        id="cart-page-header"
        aria-labelledby="cart-page-header-heading"
      >
        <PageHeaderHeading size="sm">{t("pageTitle")}</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {t("pageDescription")}
        </PageHeaderDescription>
      </PageHeader>
      {uniqueStoreIds.length > 0 ? (
        uniqueStoreIds.map(
          (storeId) =>
            storeId && <CheckoutCard key={storeId} storeId={storeId} />
        )
      ) : (
        <section
          id="cart-page-empty-cart"
          aria-labelledby="cart-page-empty-cart-heading"
          className="flex h-full flex-col items-center justify-center space-y-1 pt-16"
        >
          <Icons.cart
            className="mb-4 size-16 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="text-xl font-medium text-muted-foreground">
            {t("empty")}
          </div>
          <Link
            aria-label={t("emptyCheckout")}
            href="/products"
            className={cn(
              buttonVariants({
                variant: "link",
                size: "sm",
                className: "text-sm text-muted-foreground",
              })
            )}
          >
            {t("emptyCheckout")}
          </Link>
        </section>
      )}
    </Shell>
  )
}
