import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

const handleI18nRouting = createMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  "/(es|en)/admin(.*)",
  "/(es|en)/account(.*)",
  "/(es|en)/checkout(.*)",
  "/(es|en)/cart(.*)",
])

function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split("/")[1]
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale
}

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return
  }

  if (isProtectedRoute(req)) {
    const locale = getLocaleFromPathname(req.nextUrl.pathname)
    const origin = req.nextUrl.origin

    auth().protect({
      unauthenticatedUrl: `${origin}/${locale}/signin`,
      unauthorizedUrl: `${origin}/${locale}/`,
    })
  }

  return handleI18nRouting(req)
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
