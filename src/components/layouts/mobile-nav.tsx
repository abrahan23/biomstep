"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSelectedLayoutSegment } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ExitIcon } from "@radix-ui/react-icons"
import { useTranslations } from "next-intl"
import type { MainNavItem } from "@/types"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { LocaleSwitcher } from "@/components/layouts/locale-switcher"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SiteLogo } from "@/components/site-logo"
import { Icons } from "@/components/icons"

interface MobileNavProps {
  items?: MainNavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const segment = useSelectedLayoutSegment()
  const [open, setOpen] = React.useState(false)
  const { isSignedIn } = useAuth()
  const t = useTranslations("Auth")

  if (isDesktop) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.menu aria-hidden="true" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col pl-1 pr-0 pt-9">
        <div className="flex w-full items-center justify-between px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <SiteLogo className="h-5 w-auto" />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>
          <LocaleSwitcher />
        </div>

        <ScrollArea className="my-4 flex-1 pl-6">
          <div className="pl-1 pr-7">
            <Accordion type="multiple" className="w-full">
              {items?.map((item, index) => (
                <AccordionItem value={item.title} key={index}>
                  <AccordionTrigger className="text-sm capitalize">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-2">
                      {item.items?.map((subItem, index) =>
                        subItem.href ? (
                          <MobileLink
                            key={index}
                            href={String(subItem.href)}
                            segment={String(segment)}
                            setOpen={setOpen}
                            disabled={subItem.disabled}
                            className="m-1"
                          >
                            {subItem.title}
                          </MobileLink>
                        ) : (
                          <div
                            key={index}
                            className="text-foreground/70 transition-colors"
                          >
                            {item.title}
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>

        {/* Auth section at the bottom of the drawer */}
        <div className="border-t border-border/60 px-7 pb-8 pt-4">
          {isSignedIn ? (
            <div className="flex flex-col gap-1">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icons.dollarSign className="size-4" aria-hidden="true" />
                {t("myOrders")}
              </Link>
              <Link
                href="/signout"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                <ExitIcon className="size-4" aria-hidden="true" />
                {t("logOut")}
              </Link>
            </div>
          ) : (
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "sm" }), "w-full")}
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  disabled?: boolean
  segment: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function MobileLink({
  children,
  href,
  disabled,
  segment,
  setOpen,
  className,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground",
        href.includes(segment) && "text-foreground",
        disabled && "pointer-events-none opacity-60",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </Link>
  )
}
