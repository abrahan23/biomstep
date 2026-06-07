import { getLocale } from "next-intl/server"

import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

import { HeroHeaderEffect } from "./_components/hero-header-effect"

interface LobyLayoutProps
  extends React.PropsWithChildren<{
    modal: React.ReactNode
  }> {}

export default async function LobyLayout({ children, modal }: LobyLayoutProps) {
  const locale = await getLocale()
  const [user, mainNav] = await Promise.all([
    getCachedUser(),
    getCatalogNav(locale),
  ])

  return (
    <div className="relative flex min-h-screen flex-col">
      <HeroHeaderEffect />
      <SiteHeader user={user} mainNav={mainNav} />
      <main className="flex-1">
        {children}
        {modal}
      </main>
      <SiteFooter />
    </div>
  )
}
