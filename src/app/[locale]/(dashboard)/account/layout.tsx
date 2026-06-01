import * as React from "react"
import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/routing"
import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
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
      <SiteFooter />
    </div>
  )
}
