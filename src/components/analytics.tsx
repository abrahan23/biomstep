import { GoogleAnalytics } from "@next/third-parties/google"

import { env } from "@/env.js"

export function Analytics() {
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null

  return <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
}
