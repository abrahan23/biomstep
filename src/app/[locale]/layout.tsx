import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"

import "@/styles/globals.css"

import { siteConfig } from "@/config/site"
import { fontMono, fontSans } from "@/lib/fonts"
import { routing, type Locale } from "@/i18n/routing"
import { absoluteUrl, cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/providers"
import { TailwindIndicator } from "@/components/tailwind-indicator"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: "Metadata" })

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: {
      default: t("title"),
      template: `%s - ${siteConfig.name}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: siteConfig.url,
      title: siteConfig.name,
      description: t("description"),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: t("description"),
      images: [`${siteConfig.url}/og.jpg`],
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: "/icon.svg",
    },
    manifest: absoluteUrl("/site.webmanifest"),
  }
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <TailwindIndicator />
            <Analytics />
          </ThemeProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
