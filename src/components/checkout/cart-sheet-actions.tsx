"use client"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SheetClose, SheetFooter } from "@/components/ui/sheet"

interface CartSheetCheckoutActionProps {
  checkoutLabel: string
  viewCartLabel: string
}

export function CartSheetCheckoutAction({
  checkoutLabel,
  viewCartLabel,
}: CartSheetCheckoutActionProps) {
  return (
    <SheetFooter className="w-full sm:flex-col sm:justify-stretch sm:space-x-0">
      <SheetClose asChild>
        <Link
          aria-label={viewCartLabel}
          href="/cart"
          className={buttonVariants({
            size: "sm",
            className: "w-full",
          })}
        >
          {checkoutLabel}
        </Link>
      </SheetClose>
    </SheetFooter>
  )
}

interface CartSheetContinueShoppingActionProps {
  continueShoppingLabel: string
}

export function CartSheetContinueShoppingAction({
  continueShoppingLabel,
}: CartSheetContinueShoppingActionProps) {
  return (
    <SheetClose asChild>
      <Link
        aria-label={continueShoppingLabel}
        href="/products"
        className={cn(
          buttonVariants({
            variant: "link",
            size: "sm",
            className: "text-sm text-muted-foreground",
          })
        )}
      >
        {continueShoppingLabel}
      </Link>
    </SheetClose>
  )
}
