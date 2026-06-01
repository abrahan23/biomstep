import { getCatalogNav } from "@/lib/queries/catalog"
import { getCachedUser } from "@/lib/queries/user"
import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

interface LobyLayoutProps
  extends React.PropsWithChildren<{
    modal: React.ReactNode
  }> {}

export default async function LobyLayout({ children, modal }: LobyLayoutProps) {
  const [user, mainNav] = await Promise.all([getCachedUser(), getCatalogNav()])

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader user={user} mainNav={mainNav} />
      <main className="flex-1">
        {children}
        {modal}
      </main>
      <SiteFooter />
    </div>
  )
}
