"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"

import { adminConfig } from "@/config/admin"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SiteLogo } from "@/components/site-logo"
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

  const sidebarNav = adminConfig.sidebarNav.map((item) => ({
    ...item,
    active:
      item.href === "/admin"
        ? segments.length === 0
        : segments.includes(item.href.replace("/admin/", "")),
  }))

  return (
    <aside className={cn("h-screen w-full", className)} {...props}>
      <div className="hidden h-[3.55rem] items-center border-b border-border/60 px-4 lg:flex lg:px-6">
        <Link
          href="/"
          className="flex w-fit items-center font-heading tracking-wider text-foreground/90 transition-colors hover:text-foreground"
        >
          <SiteLogo className="h-7 w-auto" />
          <span className="sr-only">{siteConfig.name}</span>
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
