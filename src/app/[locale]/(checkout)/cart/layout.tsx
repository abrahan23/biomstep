import * as React from "react"
import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/routing"
import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteHeader } from "@/components/layouts/site-header"

export default async function CartLayout({
  children,
}: React.PropsWithChildren) {
  const locale = await getLocale()
  const [user, mainNav] = await Promise.all([
    getCachedUser(),
    getCatalogNav(locale),
  ])

  if (!user) {
    redirect({ href: "/signin", locale })
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader user={user} mainNav={mainNav} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
