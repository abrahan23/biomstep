import { redirect } from "next/navigation"

import { isAdmin } from "@/lib/auth"
import { getCachedUser } from "@/lib/queries/user"

import { SidebarProvider } from "@/components/layouts/sidebar-provider"
import { DashboardHeader } from "../store/[storeId]/_components/dashboard-header"
import { DashboardSidebar } from "../store/[storeId]/_components/dashboard-sidebar"
import { DashboardSidebarSheet } from "../store/[storeId]/_components/dashboard-sidebar-sheet"

export default async function DashboardLayout({
  children,
}: React.PropsWithChildren) {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const userIsAdmin = isAdmin(user)

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[17.5rem_1fr]">
        <DashboardSidebar
          isAdmin={userIsAdmin}
          className="top-0 z-30 hidden flex-col gap-4 border-r border-border/60 lg:sticky lg:block"
        />
        <div className="flex flex-col">
          <DashboardHeader user={user}>
            <DashboardSidebarSheet className="lg:hidden">
              <DashboardSidebar isAdmin={userIsAdmin} />
            </DashboardSidebarSheet>
          </DashboardHeader>
          <main className="flex-1 overflow-hidden px-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
