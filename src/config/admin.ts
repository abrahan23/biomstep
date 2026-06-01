import { type SidebarNavItem } from "@/types"

export interface AdminConfig {
  sidebarNav: Omit<SidebarNavItem, "active">[]
}

export const adminConfig: AdminConfig = {
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "dashboard",
      items: [],
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: "product",
      items: [],
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: "store",
      items: [],
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: "cart",
      items: [],
    },
    {
      title: "Invoices",
      href: "/admin/invoices",
      icon: "credit",
      items: [],
    },
  ],
}
