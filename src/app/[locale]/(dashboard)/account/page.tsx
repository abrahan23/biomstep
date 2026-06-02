import { type Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { env } from "@/env.js"
import { desc, eq, or } from "drizzle-orm"

import { getCachedUser } from "@/lib/queries/user"
import { getUserEmail } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"
import { AccountOrdersTable } from "@/components/tables/account-orders-table"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account")

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  }
}

export default async function AccountPage() {
  noStore()

  const t = await getTranslations("Account")
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const email = getUserEmail(user)

  const data = await db
    .select({
      id: orders.id,
      amount: orders.amount,
      quantity: orders.quantity,
      status: orders.stripePaymentIntentStatus,
      createdAt: orders.createdAt,
      invoiceUrl: orders.stripeInvoiceUrl,
    })
    .from(orders)
    .where(or(eq(orders.userId, user.id), eq(orders.email, email)))
    .orderBy(desc(orders.createdAt))

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">{t("ordersTitle")}</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {t("ordersDescription")}
        </PageHeaderDescription>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("ordersCount", { count: data.length })}
          </CardTitle>
          <CardDescription>{t("purchaseHistory")}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("emptyOrders")}</p>
          ) : (
            <AccountOrdersTable orders={data} />
          )}
        </CardContent>
      </Card>
    </Shell>
  )
}
