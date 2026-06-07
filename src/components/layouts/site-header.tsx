import type { MainNavItem } from "@/types"
import type { User } from "@clerk/nextjs/server"

import { siteConfig } from "@/config/site"
import { Link } from "@/i18n/routing"
import { CartSheet } from "@/components/checkout/cart-sheet"
import { AuthDropdown } from "@/components/layouts/auth-dropdown"
import { LocaleSwitcher } from "@/components/layouts/locale-switcher"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { ProductsCombobox } from "@/components/products-combobox"
import { SiteLogo } from "@/components/site-logo"

interface SiteHeaderProps {
  user: User | null
  mainNav: MainNavItem[]
}

export function SiteHeader({ user, mainNav }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full overflow-visible border-b bg-background">
      <div className="container relative flex h-16 items-center">
        <MainNav items={mainNav} />
        <MobileNav items={mainNav} />

        {/* Logo centered in the header bar — only on mobile/tablet */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center lg:hidden"
          aria-label={siteConfig.name}
        >
          <SiteLogo className="h-9 w-auto" />
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <LocaleSwitcher className="hidden sm:flex" />
            <ProductsCombobox />
            <CartSheet />
            <span className="hidden lg:block">
              <AuthDropdown user={user} />
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}
