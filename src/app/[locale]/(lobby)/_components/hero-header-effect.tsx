"use client"

import { useEffect } from "react"

/**
 * Makes the sticky site header transparent while the hero is visible at the
 * top of the page, then fades it back to bg-background as the user scrolls.
 * Rendered in the lobby layout so it only applies to lobby pages.
 */
export function HeroHeaderEffect() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.sticky")
    if (!header) return

    header.style.transition =
      "background-color 350ms ease, border-color 350ms ease, backdrop-filter 350ms ease"

    const update = () => {
      const atTop = window.scrollY < 64
      header.style.backgroundColor = atTop ? "transparent" : ""
      header.style.borderBottomColor = atTop ? "transparent" : ""
      header.style.backdropFilter = atTop ? "none" : "blur(14px)"
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
      header.style.transition = ""
      header.style.backgroundColor = ""
      header.style.borderBottomColor = ""
      header.style.backdropFilter = ""
    }
  }, [])

  return null
}
