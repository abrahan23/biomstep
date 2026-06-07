import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { JoinNewsletterForm } from "@/components/join-newsletter-form"
import { LocaleSwitcher } from "@/components/layouts/locale-switcher"
import { Shell } from "@/components/shell"
import { SiteLogo } from "@/components/site-logo"

export async function SiteFooter() {
  const t = await getTranslations("Footer")
  const tCommon = await getTranslations("Common")

  const footerSections = [
    {
      title: t("credits"),
      items: siteConfig.footerNav[0]?.items ?? [],
    },
    {
      title: t("help"),
      items: [
        { title: t("about"), href: "/about", external: false },
        { title: t("contact"), href: "/contact", external: false },
        { title: t("terms"), href: "/terms", external: false },
        { title: t("privacy"), href: "/privacy", external: false },
      ],
    },
    {
      title: t("social"),
      items: siteConfig.footerNav[2]?.items ?? [],
    },
  ]

  return (
    <footer className="w-full border-t bg-background">
      <Shell>
        <section className="flex flex-col gap-10 lg:flex-row lg:gap-20">
          <section className="space-y-4">
            <Link href="/" className="flex w-fit items-center">
              <SiteLogo className="h-20 w-auto" />
              <span className="sr-only">{siteConfig.name}</span>
              <span className="sr-only">{tCommon("home")}</span>
            </Link>
            <LocaleSwitcher />
          </section>
          <section className="grid flex-1 grid-cols-1 gap-10 xxs:grid-cols-2 sm:grid-cols-3">
            {footerSections.map((item) => (
              <div key={item.title} className="space-y-3">
                <h4 className="text-base font-medium">{item.title}</h4>
                <ul className="space-y-2.5">
                  {item.items.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        target={link?.external ? "_blank" : undefined}
                        rel={link?.external ? "noreferrer" : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.title}
                        <span className="sr-only">{link.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <section className="space-y-3">
            <h4 className="text-base font-medium">{t("newsletterTitle")}</h4>
            <JoinNewsletterForm />
          </section>
        </section>
        <section className="flex items-center space-x-4">
          <div className="flex-1 text-left text-sm leading-loose text-muted-foreground">
            {t("builtBy")}{" "}
            <Link
              href="https://softwarecompote.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold transition-colors hover:text-foreground"
            >
              Software Compote LLC
              <span className="sr-only">Software Compote LLC</span>
            </Link>
            .
          </div>
          <div className="flex items-center space-x-1">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })
              )}
            >
              <Icons.gitHub className="size-4" aria-hidden="true" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </section>
      </Shell>
    </footer>
  )
}
