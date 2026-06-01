import { env } from "@/env.js"
import { loadStripe, type Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

// Single-store e-commerce: all charges go to the platform account, so no
// connected-account context is needed when loading Stripe.js.
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}
