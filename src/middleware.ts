import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Routes that require authentication. Admin-role enforcement for /admin is
// handled in the admin layout via the user's Clerk public metadata, since the
// role lives in metadata rather than the edge session token by default.
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/account(.*)",
  "/checkout(.*)",
  "/cart(.*)",
])

export default clerkMiddleware((auth, req) => {
  // UploadThing handles its own auth in the file router middleware and
  // receives dev callbacks on this route — Clerk must not block it.
  if (req.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return
  }

  if (isProtectedRoute(req)) {
    const url = new URL(req.nextUrl.origin)

    auth().protect({
      unauthenticatedUrl: `${url.origin}/signin`,
      unauthorizedUrl: `${url.origin}/`,
    })
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
