import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"

import { getCart } from "@/lib/actions/cart"
import { cn, formatPrice } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CartLineItems } from "@/components/checkout/cart-line-items"

interface CheckoutCardProps {
  storeId: string
}

export async function CheckoutCard({ storeId }: CheckoutCardProps) {
  const t = await getTranslations("Cart")
  const cartLineItems = await getCart({ storeId })
  const itemCount = cartLineItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <Card
      key={storeId}
      as="section"
      id={`checkout-store-${storeId}`}
      aria-labelledby={`checkout-store-${storeId}-heading`}
      className={cn(
        cartLineItems.length > 0 ? "border-green-500" : "border-destructive"
      )}
    >
      <CardHeader className="flex flex-row items-center space-x-4 py-4">
        <CardTitle className="line-clamp-1 flex-1">
          {cartLineItems[0]?.storeName}
        </CardTitle>
        <Link
          aria-label={t("storeCheckout")}
          href={`/checkout/${storeId}`}
          className={cn(
            buttonVariants({
              size: "sm",
            })
          )}
        >
          {t("storeCheckout")}
        </Link>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="pb-6 pl-6 pr-0">
        <CartLineItems items={cartLineItems} className="max-h-[280px]" />
      </CardContent>
      <Separator className="mb-4" />
      <CardFooter className="space-x-4">
        <span className="flex-1">
          {t("totalItems", { count: itemCount })}
        </span>
        <span>
          {formatPrice(
            cartLineItems.reduce(
              (acc, item) => acc + Number(item.price) * item.quantity,
              0
            )
          )}
        </span>
      </CardFooter>
    </Card>
  )
}
