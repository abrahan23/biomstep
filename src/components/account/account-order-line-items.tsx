import Image from "next/image"

import { Link } from "@/i18n/routing"
import { formatPrice } from "@/lib/utils"
import { type CartLineItemSchema } from "@/lib/validations/cart"
import { Icons } from "@/components/icons"

interface AccountOrderLineItemsProps {
  items: CartLineItemSchema[]
  labels: {
    viewProduct: (name: string) => string
    quantity: (count: number) => string
    each: string
  }
}

export function AccountOrderLineItems({
  items,
  labels,
}: AccountOrderLineItemsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {items.map((item) => (
        <Link
          aria-label={labels.viewProduct(item.name)}
          key={`${item.id}-${item.variant ?? ""}`}
          href={`/product/${item.id}`}
          className="rounded-md border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative aspect-square size-16 min-w-fit overflow-hidden rounded">
                {item.images?.length ? (
                  <Image
                    src={
                      item.images[0]?.url ?? "/images/product-placeholder.webp"
                    }
                    alt={item.images[0]?.name ?? item.name}
                    sizes="64px"
                    fill
                    className="absolute object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary">
                    <Icons.placeholder
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-1 self-start">
                <span className="line-clamp-2 text-sm font-medium">
                  {item.name}
                </span>
                {item.variant ? (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {item.variant}
                  </span>
                ) : null}
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {labels.quantity(item.quantity)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1 font-medium">
              <span className="text-sm">
                {formatPrice(
                  (Number(item.price) * item.quantity).toFixed(2)
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPrice(item.price)} {labels.each}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
