import { type Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { db } from "@/db"
import { addresses, orders } from "@/db/schema"
import { env } from "@/env.js"
import { and, eq, or } from "drizzle-orm"
import type { StripePaymentStatus } from "@/types"

import { AccountOrderLineItems } from "@/components/account/account-order-line-items"
import { OrderShippingAddress } from "@/components/account/order-shipping-address"
import { getOrderLineItems } from "@/lib/actions/order"
import { getStripePaymentStatusColor } from "@/lib/checkout"
import { getCachedUser } from "@/lib/queries/user"
import { Link } from "@/i18n/routing"
import { cn, formatDate, formatId, formatPrice, getUserEmail } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account")

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: t("orderMetadataTitle"),
    description: t("orderMetadataDescription"),
  }
}

interface AccountOrderPageProps {
  params: {
    orderId: string
  }
}

export default async function AccountOrderPage({
  params,
}: AccountOrderPageProps) {
  const t = await getTranslations("Account")
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const orderId = decodeURIComponent(params.orderId)
  const email = getUserEmail(user)

  const orderRow = await db
    .select({
      order: orders,
      address: {
        line1: addresses.line1,
        line2: addresses.line2,
        city: addresses.city,
        state: addresses.state,
        postalCode: addresses.postalCode,
        country: addresses.country,
      },
    })
    .from(orders)
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(
      and(
        eq(orders.id, orderId),
        or(eq(orders.userId, user.id), eq(orders.email, email))
      )
    )
    .then((rows) => rows[0])

  if (!orderRow) {
    notFound()
  }

  const order = orderRow.order

  const orderLineItems = await getOrderLineItems({
    items: String(order.items),
    storeId: order.storeId,
  })

  const status = order.stripePaymentIntentStatus as StripePaymentStatus
  const statusKey = `status.${status}` as `status.${StripePaymentStatus}`
  const statusLabel = t.has(statusKey) ? t(statusKey) : status

  return (
    <Shell>
      <PageHeader>
        <Link
          href="/account"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-2 w-fit px-0 hover:bg-transparent"
          )}
        >
          <ArrowLeftIcon className="mr-2 size-4" aria-hidden="true" />
          {t("backToOrders")}
        </Link>
        <PageHeaderHeading size="sm">
          {t("orderNumber", { id: formatId(order.id) })}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {t("orderDetailsDescription")}
        </PageHeaderDescription>
      </PageHeader>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle as="h2" className="text-xl">
              {t("orderDetails")}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-sm text-white",
                getStripePaymentStatusColor({ status, shade: 600 })
              )}
            >
              {statusLabel}
            </Badge>
          </div>
          <CardDescription>{formatDate(order.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrderShippingAddress
            name={order.name}
            email={order.email}
            address={orderRow.address}
            labels={{
              title: t("shippingAddress"),
              recipient: t("recipient"),
              noAddress: t("noShippingAddress"),
            }}
          />
          <AccountOrderLineItems
            items={orderLineItems}
            labels={{
              viewProduct: (name) => t("viewProduct", { name }),
              quantity: (count) => t("quantity", { count }),
              each: t("each"),
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-6">
          <span className="text-base font-semibold">
            {t("total")} {formatPrice(order.amount)}
          </span>
          {order.stripeInvoiceUrl ? (
            <Link
              href={order.stripeInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {t("viewInvoice")}
            </Link>
          ) : null}
        </CardFooter>
      </Card>
    </Shell>
  )
}
