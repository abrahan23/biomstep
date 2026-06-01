"use client"

import { useLocale } from "next-intl"

import { Link, usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const locales = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
] as const

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wide",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map(({ code, label }, index) => (
        <span key={code} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted-foreground/60">
              |
            </span>
          ) : null}
          <Link
            href={pathname}
            locale={code}
            className={cn(
              "rounded px-1 py-0.5 transition-colors hover:text-foreground",
              locale === code
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
            aria-current={locale === code ? "true" : undefined}
          >
            {label}
          </Link>
        </span>
      ))}
    </div>
  )
}
