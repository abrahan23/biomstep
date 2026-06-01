import { type Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Onboarding",
}

// Single-store e-commerce: there is no per-user store onboarding anymore.
export default function OnboardingPage() {
  redirect("/")
}
