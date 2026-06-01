import { getTranslations } from "next-intl/server"

import { getCart } from "@/lib/actions/cart"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  CartSheetCheckoutAction,
  CartSheetContinueShoppingAction,
} from "@/components/checkout/cart-sheet-actions"
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
      <SheetContent className="flex w-full flex-col overflow-hidden pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>
            {t("title")} {itemCount > 0 && `(${itemCount})`}
          </SheetTitle>
          <Separator />
        </SheetHeader>
        {itemCount > 0 ? (
          <>
            <CartLineItems
              items={cartLineItems}
              className="min-h-0 flex-1 overflow-hidden"
            />
            <div className="shrink-0 space-y-4 pr-6">
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
              <CartSheetCheckoutAction
                checkoutLabel={t("checkout")}
                viewCartLabel={t("viewCart")}
              />
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
            <CartSheetContinueShoppingAction
              continueShoppingLabel={t("continueShopping")}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
