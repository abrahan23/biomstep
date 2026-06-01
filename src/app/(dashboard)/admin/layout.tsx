import * as React from "react"
import { redirect } from "next/navigation"

import { getCachedUser } from "@/lib/queries/user"
import { getUserRole } from "@/lib/auth"
import { AuthDropdown } from "@/components/layouts/auth-dropdown"
import { SidebarProvider } from "@/components/layouts/sidebar-provider"

import { AdminSidebar } from "./_components/admin-sidebar"
import { DashboardSidebarSheet } from "../store/[storeId]/_components/dashboard-sidebar-sheet"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  // Single-store e-commerce: only the admin (Clerk publicMetadata.role) can
  // access the management area.
  if (getUserRole(user) !== "admin") {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[17.5rem_1fr]">
        <AdminSidebar className="top-0 z-30 hidden flex-col gap-4 border-r border-border/60 lg:sticky lg:block" />
        <div className="flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-6">
              <DashboardSidebarSheet className="lg:hidden">
                <AdminSidebar />
              </DashboardSidebarSheet>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <nav className="flex items-center space-x-2">
                  <AuthDropdown user={user} />
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-hidden px-6 pt-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
