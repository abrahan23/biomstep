import { redirect } from "next/navigation"

// Single-store e-commerce: the per-store dashboard has been replaced by the
// role-gated /admin area. Funnel any legacy /store/* links there.
export default function LegacyStoreLayout() {
  redirect("/admin")
}
