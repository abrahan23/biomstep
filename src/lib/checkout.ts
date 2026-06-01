import type { StripePaymentStatus } from "@/types"

import { cn } from "@/lib/utils"
import { type CartLineItemSchema } from "@/lib/validations/cart"

// Single-store e-commerce: payments go directly to the platform account, so
// there is no marketplace application fee.
export function calculateOrderAmount(items: CartLineItemSchema[]) {
  const total = items.reduce((acc, item) => {
    return acc + Number(item.price) * item.quantity
  }, 0)
  return {
    total: Number((total * 100).toFixed(0)), // converts to cents which stripe charges in
  }
}

export const stripePaymentStatuses: {
  label: string
  value: StripePaymentStatus
}[] = [
  { label: "Canceled", value: "canceled" },
  { label: "Processing", value: "processing" },
  { label: "Requires Action", value: "requires_action" },
  { label: "Requires Capture", value: "requires_capture" },
  { label: "Requires Confirmation", value: "requires_confirmation" },
  { label: "Requires Payment Method", value: "requires_payment_method" },
  { label: "Succeeded", value: "succeeded" },
]

export function getStripePaymentStatusColor({
  status,
  shade = 600,
}: {
  status: StripePaymentStatus
  shade?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
}) {
  const bg = `bg-${shade}`

  return cn({
    [`${bg}-red`]: status === "canceled",
    [`${bg}-yellow`]: [
      "processing",
      "requires_action",
      "requires_capture",
      "requires_confirmation",
      "requires_payment_method",
    ].includes(status),
    [`bg-green-${shade}`]: status === "succeeded",
  })
}
