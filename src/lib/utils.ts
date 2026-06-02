import { env } from "@/env.js"
import type { User } from "@clerk/nextjs/server"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { storeConfig } from "@/config/store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}

const priceLocales: Record<string, string> = {
  es: "es-ES",
  en: "en-GB",
}

export function formatPrice(
  price: number | string,
  opts: Intl.NumberFormatOptions & { locale?: string } = {}
) {
  const { locale, currency, notation, ...intlOpts } = opts

  return new Intl.NumberFormat(locale ?? storeConfig.priceLocale, {
    style: "currency",
    currency: (currency ?? storeConfig.currency).toUpperCase(),
    notation: notation ?? "standard",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...intlOpts,
  }).format(Number(price))
}

/** Formatea un precio según el locale de la ruta (`es` | `en`). */
export function formatPriceForLocale(
  price: number | string,
  locale: string,
  opts: Intl.NumberFormatOptions = {}
) {
  return formatPrice(price, {
    locale: priceLocales[locale] ?? storeConfig.priceLocale,
    ...opts,
  })
}

export function formatNumber(
  number: number | string,
  opts: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat("en-US", {
    style: opts.style ?? "decimal",
    notation: opts.notation ?? "standard",
    minimumFractionDigits: opts.minimumFractionDigits ?? 0,
    maximumFractionDigits: opts.maximumFractionDigits ?? 2,
    ...opts,
  }).format(Number(number))
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date))
}

export function formatBytes(
  bytes: number,
  decimals = 0,
  sizeType: "accurate" | "normal" = "normal"
) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytest")
      : (sizes[i] ?? "Bytes")
  }`
}

export function formatId(id: string) {
  return `#${id.toString().padStart(4, "0")}`
}

export function slugify(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function unslugify(str: string) {
  return str.replace(/-/g, " ")
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  )
}

export function toSentenceCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function getUserEmail(user: User | null) {
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? ""

  return email
}

export type ShippingAddressFields = {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
}

export function formatShippingAddressLines(address: ShippingAddressFields) {
  const cityLine = [address.postalCode, address.city].filter(Boolean).join(" ")

  return [
    address.line1,
    address.line2,
    cityLine || null,
    address.state,
    address.country,
  ].filter((line): line is string => Boolean(line?.trim()))
}

export function isMacOs() {
  if (typeof window === "undefined") return false

  return window.navigator.userAgent.includes("Mac")
}
