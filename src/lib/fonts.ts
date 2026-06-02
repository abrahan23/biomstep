import { Plus_Jakarta_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"

/**
 * Plus Jakarta Sans — sans geométrica redondeada, muy usada en marcas
 * premium / wellness / SaaS. Una sola familia: peso y tracking marcan la jerarquía.
 */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

/** Misma familia que el cuerpo; los títulos usan `font-heading` + pesos más altos. */
export const fontHeading = fontSans

export const fontMono = GeistMono
