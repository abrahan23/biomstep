"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { addToCart } from "@/lib/actions/cart"
import { showErrorToast } from "@/lib/handle-error"
import { cn, formatPrice } from "@/lib/utils"
import { updateCartItemSchema } from "@/lib/validations/cart"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"

interface Option {
  id: string
  name: string
  values: string[]
  rank: number
}

interface Sku {
  id: string
  options: Record<string, string>
  price: string
  inventory: number
}

interface AddToCartFormProps {
  productId: string
  options?: Option[]
  skus?: Sku[]
  showBuyNow?: boolean
}

type Inputs = z.infer<typeof updateCartItemSchema>

export function AddToCartForm({
  productId,
  options = [],
  skus = [],
  showBuyNow,
}: AddToCartFormProps) {
  const id = React.useId()
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const [isBuyingNow, setIsBuyingNow] = React.useState(false)

  const hasVariants = options.length > 0 && skus.length > 0

  // Selected value per option type, keyed by option id.
  const [selected, setSelected] = React.useState<Record<string, string>>({})

  const form = useForm<Inputs>({
    resolver: zodResolver(updateCartItemSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  // The SKU that matches the current selection across all option types.
  const matchedSku = React.useMemo(() => {
    if (!hasVariants) return undefined
    if (options.some((o) => !selected[o.id])) return undefined

    return skus.find((sku) =>
      options.every((o) => sku.options[o.id] === selected[o.id])
    )
  }, [hasVariants, options, selected, skus])

  // A value is selectable if at least one in-stock SKU is consistent with the
  // currently selected values of the other option types.
  function isValueAvailable(optionId: string, value: string) {
    return skus.some((sku) => {
      if (sku.inventory <= 0) return false
      if (sku.options[optionId] !== value) return false
      return options.every(
        (o) =>
          o.id === optionId ||
          !selected[o.id] ||
          sku.options[o.id] === selected[o.id]
      )
    })
  }

  function variantLabel() {
    return options
      .map((o) => `${o.name}: ${selected[o.id]}`)
      .join(", ")
  }

  async function addSelectedToCart(quantity: number) {
    if (!hasVariants) {
      return addToCart({ productId, quantity })
    }

    if (options.some((o) => !selected[o.id])) {
      showErrorToast("Please select all options.")
      return { error: "Please select all options." }
    }

    if (!matchedSku) {
      showErrorToast("That combination is not available.")
      return { error: "That combination is not available." }
    }

    if (matchedSku.inventory < quantity) {
      showErrorToast("That combination is out of stock.")
      return { error: "That combination is out of stock." }
    }

    return addToCart({
      productId,
      quantity,
      variant: variantLabel(),
      price: Number(matchedSku.price),
      skuId: matchedSku.id,
    })
  }

  async function onSubmit(data: Inputs) {
    setIsAddingToCart(true)
    const { error } = await addSelectedToCart(data.quantity)

    if (error) {
      setIsAddingToCart(false)
      return
    }

    toast.success("Product added to cart")
    setIsAddingToCart(false)
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex max-w-[260px] flex-col gap-4")}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {hasVariants ? (
          <div className="flex flex-col gap-3">
            {options.map((option) => (
              <div key={option.id} className="space-y-1.5">
                <span className="text-sm font-medium">{option.name}</span>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isSelected = selected[option.id] === value
                    const available = isValueAvailable(option.id, value)
                    return (
                      <Button
                        key={value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        disabled={!available && !isSelected}
                        onClick={() =>
                          setSelected((prev) => ({
                            ...prev,
                            [option.id]: value,
                          }))
                        }
                      >
                        {value}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
            {matchedSku ? (
              <p className="text-sm font-medium">
                {formatPrice(matchedSku.price)} · {matchedSku.inventory} in stock
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={cn("flex gap-4", showBuyNow ? "flex-col" : "flex-row")}>
          <div className="flex items-center">
            <Button
              id={`${id}-decrement`}
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0 rounded-r-none"
              onClick={() =>
                form.setValue(
                  "quantity",
                  Math.max(0, form.getValues("quantity") - 1)
                )
              }
              disabled={isAddingToCart}
            >
              <MinusIcon className="size-3" aria-hidden="true" />
              <span className="sr-only">Remove one item</span>
            </Button>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="h-8 w-16 rounded-none border-x-0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        const parsedValue = parseInt(value, 10)
                        if (isNaN(parsedValue)) return
                        field.onChange(parsedValue)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              id={`${id}-increment`}
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0 rounded-l-none"
              onClick={() =>
                form.setValue("quantity", form.getValues("quantity") + 1)
              }
              disabled={isAddingToCart}
            >
              <PlusIcon className="size-3" aria-hidden="true" />
              <span className="sr-only">Add one item</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2.5">
            {showBuyNow ? (
              <Button
                type="button"
                aria-label="Buy now"
                size="sm"
                className="w-full"
                onClick={async () => {
                  setIsBuyingNow(true)

                  const { error } = await addSelectedToCart(
                    form.getValues("quantity")
                  )

                  if (error) {
                    setIsBuyingNow(false)
                    return
                  }

                  router.push("/cart")
                  setIsBuyingNow(false)
                }}
                disabled={isBuyingNow}
              >
                {isBuyingNow && (
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Buy now
              </Button>
            ) : null}
            <Button
              aria-label="Add to cart"
              type="submit"
              variant={showBuyNow ? "outline" : "default"}
              size="sm"
              className="w-full"
              disabled={isAddingToCart}
            >
              {isAddingToCart && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Add to cart
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
