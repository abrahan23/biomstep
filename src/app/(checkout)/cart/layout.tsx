import * as React from "react"
import { redirect } from "next/navigation"

import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteHeader } from "@/components/layouts/site-header"

export default async function CartLayout({
  children,
}: React.PropsWithChildren) {
  const [user, mainNav] = await Promise.all([getCachedUser(), getCatalogNav()])

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader user={user} mainNav={mainNav} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
