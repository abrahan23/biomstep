import { formatShippingAddressLines } from "@/lib/utils"

interface OrderShippingAddressProps {
  name: string
  email: string
  address: {
    line1: string | null
    line2: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    country: string | null
  } | null
  labels: {
    title: string
    recipient: string
    noAddress: string
  }
}

export function OrderShippingAddress({
  name,
  email,
  address,
  labels,
}: OrderShippingAddressProps) {
  const lines = address ? formatShippingAddressLines(address) : []

  return (
    <section className="rounded-md border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold">{labels.title}</h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">{labels.recipient}:</span>{" "}
          {name}
        </p>
        <p>{email}</p>
        {lines.length > 0 ? (
          lines.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p>{labels.noAddress}</p>
        )}
      </div>
    </section>
  )
}
