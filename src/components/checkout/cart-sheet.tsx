import { getTranslations } from "next-intl/server"

import { getCart } from "@/lib/actions/cart"
import { Link } from "@/i18n/routing"
import { cn, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartLineItems } from "@/components/checkout/cart-line-items"
import { Icons } from "@/components/icons"

export async function CartSheet() {
  const t = await getTranslations("Cart")
  const cartLineItems = await getCart()

  const itemCount = cartLineItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  )

  const cartTotal = cartLineItems.reduce(
    (total, item) => total + item.quantity * Number(item.price),
    0
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={t("openCart")}
          variant="outline"
          size="icon"
          className="relative"
        >
          {itemCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 size-6 justify-center rounded-full p-2.5"
            >
              {itemCount}
            </Badge>
          )}
          <Icons.cart className="size-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>
            {t("title")} {itemCount > 0 && `(${itemCount})`}
          </SheetTitle>
          <Separator />
        </SheetHeader>
        {itemCount > 0 ? (
          <>
            <CartLineItems items={cartLineItems} className="flex-1" />
            <div className="space-y-4 pr-6">
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex">
                  <span className="flex-1">{t("shipping")}</span>
                  <span>{t("free")}</span>
                </div>
                <div className="flex">
                  <span className="flex-1">{t("taxes")}</span>
                  <span>{t("taxesNote")}</span>
                </div>
                <div className="flex">
                  <span className="flex-1">{t("total")}</span>
                  <span>{formatPrice(cartTotal.toFixed(2))}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetTrigger asChild>
                  <Link
                    aria-label={t("viewCart")}
                    href="/cart"
                    className={buttonVariants({
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    {t("checkout")}
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            <Icons.cart
              className="mb-4 size-16 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="text-xl font-medium text-muted-foreground">
              {t("empty")}
            </div>
            <SheetTrigger asChild>
              <Link
                aria-label={t("continueShopping")}
                href="/products"
                className={cn(
                  buttonVariants({
                    variant: "link",
                    size: "sm",
                    className: "text-sm text-muted-foreground",
                  })
                )}
              >
                {t("continueShopping")}
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
