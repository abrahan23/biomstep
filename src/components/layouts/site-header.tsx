import type { MainNavItem } from "@/types"
import type { User } from "@clerk/nextjs/server"

import { CartSheet } from "@/components/checkout/cart-sheet"
import { AuthDropdown } from "@/components/layouts/auth-dropdown"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { ProductsCombobox } from "@/components/products-combobox"

interface SiteHeaderProps {
  user: User | null
  mainNav: MainNavItem[]
}

export function SiteHeader({ user, mainNav }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full overflow-visible border-b bg-background">
      <div className="container flex h-16 items-center">
        <MainNav items={mainNav} />
        <MobileNav items={mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ProductsCombobox />
            <CartSheet />
            <AuthDropdown user={user} />
          </nav>
        </div>
      </div>
    </header>
  )
}
