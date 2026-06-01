"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"

import {
  deleteProductSku,
  generateProductSkus,
  saveProductOptions,
  saveProductSkus,
} from "@/lib/actions/variant"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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

interface ProductVariantsProps {
  productId: string
  options: Option[]
  skus: Sku[]
}

interface OptionDraft {
  name: string
  values: string
}

function toDraft(options: Option[]): OptionDraft[] {
  return options.map((o) => ({ name: o.name, values: o.values.join(", ") }))
}

export function ProductVariants({
  productId,
  options,
  skus,
}: ProductVariantsProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const [optionDrafts, setOptionDrafts] = React.useState<OptionDraft[]>(
    options.length > 0 ? toDraft(options) : [{ name: "", values: "" }]
  )

  // Local, editable copy of the SKU price/inventory values.
  const [skuDrafts, setSkuDrafts] = React.useState<Sku[]>(skus)

  React.useEffect(() => {
    setSkuDrafts(skus)
  }, [skus])

  const optionNameById = React.useMemo(
    () => new Map(options.map((o) => [o.id, o.name])),
    [options]
  )

  function addOption() {
    setOptionDrafts((prev) => [...prev, { name: "", values: "" }])
  }

  function removeOption(index: number) {
    setOptionDrafts((prev) => prev.filter((_, i) => i !== index))
  }

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setOptionDrafts((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...patch } : o))
    )
  }

  function onSaveOptions() {
    const parsed = optionDrafts
      .map((o) => ({
        name: o.name.trim(),
        values: o.values
          .split(/[,\n]/)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((o) => o.name && o.values.length > 0)

    startTransition(async () => {
      const { error } = await saveProductOptions({
        productId,
        options: parsed,
      })

      if (error) {
        toast.error(error)
        return
      }

      const { error: genError } = await generateProductSkus(productId)

      if (genError) {
        toast.error(genError)
        return
      }

      toast.success("Options saved and combinations generated.")
      router.refresh()
    })
  }

  function onSaveSkus() {
    startTransition(async () => {
      const { error } = await saveProductSkus({
        productId,
        skus: skuDrafts.map((s) => ({
          id: s.id,
          options: s.options,
          price: s.price,
          inventory: s.inventory,
        })),
      })

      if (error) {
        toast.error(error)
        return
      }

      toast.success("Combinations updated.")
      router.refresh()
    })
  }

  function onDeleteSku(id: string) {
    startTransition(async () => {
      const { error } = await deleteProductSku({ id, productId })

      if (error) {
        toast.error(error)
        return
      }

      toast.success("Combination removed.")
      router.refresh()
    })
  }

  function skuLabel(sku: Sku) {
    return Object.entries(sku.options)
      .map(([optionId, value]) => `${optionNameById.get(optionId) ?? "?"}: ${value}`)
      .join(" / ")
  }

  return (
    <Card as="section">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Variants</CardTitle>
        <CardDescription>
          Define option types (e.g. Color, Talla) with their values, then set a
          price and stock for each combination (e.g. Azul / 38).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Option types</h3>
          {optionDrafts.map((option, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <div className="w-full space-y-1.5 sm:w-1/3">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g. Color"
                  value={option.name}
                  onChange={(e) => updateOption(index, { name: e.target.value })}
                />
              </div>
              <div className="w-full space-y-1.5">
                <Label className="text-xs">Values (comma separated)</Label>
                <Input
                  placeholder="e.g. Azul, Verde, Negro"
                  value={option.values}
                  onChange={(e) =>
                    updateOption(index, { values: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={optionDrafts.length === 1}
                onClick={() => removeOption(index)}
                aria-label="Remove option"
              >
                <TrashIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <PlusIcon className="mr-1 size-4" aria-hidden="true" />
              Add option type
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={onSaveOptions}
            >
              {isPending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Save options & generate combinations
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Combinations ({skuDrafts.length})
            </h3>
            {skuDrafts.length > 0 ? (
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={onSaveSkus}
              >
                {isPending && (
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Save combinations
              </Button>
            ) : null}
          </div>

          {skuDrafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No combinations yet. Add option types above and save to generate
              them.
            </p>
          ) : (
            <div className="space-y-2">
              {skuDrafts.map((sku, index) => (
                <div
                  key={sku.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-1">
                    <span className="text-sm font-medium">
                      {skuLabel(sku)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(sku.price)} · {sku.inventory} in stock
                    </p>
                  </div>
                  <div className="w-full space-y-1.5 sm:w-28">
                    <Label className="text-xs">Price</Label>
                    <Input
                      inputMode="decimal"
                      value={sku.price}
                      onChange={(e) =>
                        setSkuDrafts((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, price: e.target.value } : s
                          )
                        )
                      }
                    />
                  </div>
                  <div className="w-full space-y-1.5 sm:w-28">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={sku.inventory}
                      onChange={(e) =>
                        setSkuDrafts((prev) =>
                          prev.map((s, i) =>
                            i === index
                              ? {
                                  ...s,
                                  inventory: Number(e.target.value) || 0,
                                }
                              : s
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isPending}
                    onClick={() => onDeleteSku(sku.id)}
                    aria-label="Remove combination"
                  >
                    <TrashIcon className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
