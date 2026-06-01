import * as React from "react"
import { redirect } from "next/navigation"

import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const [user, mainNav] = await Promise.all([getCachedUser(), getCatalogNav()])

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader user={user} mainNav={mainNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
