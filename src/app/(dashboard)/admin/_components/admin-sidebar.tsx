"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"
import { type SidebarNavItem } from "@/types"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { SidebarNav } from "@/components/layouts/sidebar-nav"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export function AdminSidebar({
  children,
  className,
  ...props
}: AdminSidebarProps) {
  const segments = useSelectedLayoutSegments()

  const sidebarNav: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "dashboard",
      active: segments.length === 0,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: "product",
      active: segments.includes("products"),
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: "store",
      active: segments.includes("categories"),
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: "cart",
      active: segments.includes("orders"),
    },
    {
      title: "Invoices",
      href: "/admin/invoices",
      icon: "credit",
      active: segments.includes("invoices"),
    },
  ]

  return (
    <aside className={cn("h-screen w-full", className)} {...props}>
      <div className="hidden h-[3.55rem] items-center border-b border-border/60 px-4 lg:flex lg:px-6">
        <Link
          href="/"
          className="flex w-fit items-center font-heading tracking-wider text-foreground/90 transition-colors hover:text-foreground"
        >
          <Icons.logo className="mb-1 mr-2 size-7" aria-hidden="true" />
          {siteConfig.name}
        </Link>
      </div>
      {children ? (
        <div className="flex flex-col gap-2.5 px-4 pt-2 lg:px-6 lg:pt-4">
          {children}
        </div>
      ) : null}
      <ScrollArea className="h-[calc(100vh-8rem)] px-3 py-2.5 lg:px-5">
        <SidebarNav items={sidebarNav} className="p-1 pt-4" />
      </ScrollArea>
    </aside>
  )
}
