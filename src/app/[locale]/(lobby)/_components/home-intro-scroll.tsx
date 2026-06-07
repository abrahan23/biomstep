"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion"
import { useTranslations } from "next-intl"

import { storeConfig } from "@/config/store"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

import { mapRange } from "./home-scroll-utils"
import { ScrollScrubCanvas } from "./scroll-scrub-canvas"

/** Scroll height dedicated to scrubbing the image sequence. */
const SEQUENCE_SCROLL_VH = 220
/** Extra scroll after the sequence to animate categories into view. */
const CATEGORIES_REVEAL_VH = 24

interface HomeIntroScrollProps {
  categoriesReveal: React.ReactNode
}

export function HomeIntroScroll({ categoriesReveal }: HomeIntroScrollProps) {
  const t = useTranslations("Home.hero")
  const tCommon = useTranslations("Common")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const totalScrollVh = SEQUENCE_SCROLL_VH + CATEGORIES_REVEAL_VH

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Normalise progress within the sequence phase (0 → 1 as the user scrolls
  // through the image sequence, then stays at 1 during the categories reveal).
  const sequencePhaseEnd = SEQUENCE_SCROLL_VH / totalScrollVh
  const sequenceScrollProgress = useTransform(scrollYProgress, (v) =>
    Math.min(1, v / sequencePhaseEnd)
  )

  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [stageVisible, setStageVisible] = React.useState(true)

  useMotionValueEvent(scrollYProgress, "change", (v) => setScrollProgress(v))

  React.useEffect(() => {
    const updateVisibility = () => {
      const el = containerRef.current
      if (!el) return
      setStageVisible(el.getBoundingClientRect().bottom > 0)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    window.addEventListener("resize", updateVisibility)
    return () => {
      window.removeEventListener("scroll", updateVisibility)
      window.removeEventListener("resize", updateVisibility)
    }
  }, [])

  // Derived animation values
  const heroRiseStart = sequencePhaseEnd * 0.22
  const heroRiseEnd = sequencePhaseEnd * 0.46
  const heroFadeStart = sequencePhaseEnd * 0.44
  const heroFadeEnd = sequencePhaseEnd * 0.56

  const categoriesRevealShare = CATEGORIES_REVEAL_VH / totalScrollVh
  const categoriesStart = sequencePhaseEnd * 0.5
  const categoriesEnd = Math.min(
    0.97,
    sequencePhaseEnd + categoriesRevealShare * 0.85
  )
  const categoriesTopVh = Math.round(SEQUENCE_SCROLL_VH * 0.5)

  const heroTextY = mapRange(scrollProgress, heroRiseStart, heroRiseEnd, 0, -280)
  const heroTextOpacity = mapRange(
    scrollProgress,
    heroFadeStart,
    heroFadeEnd,
    1,
    0
  )
  const heroCtasOpacity = mapRange(
    scrollProgress,
    heroFadeStart * 0.95,
    heroFadeEnd,
    1,
    0
  )
  const canvasScale = mapRange(
    Math.min(1, scrollProgress / sequencePhaseEnd),
    0,
    1,
    1,
    1.06
  )
  const categoriesY = mapRange(scrollProgress, categoriesStart, categoriesEnd, 72, 0)

  const sequenceComplete = scrollProgress >= sequencePhaseEnd * 0.98

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Scroll spacer — creates the trackable height */}
      <section
        className="relative w-full"
        style={{ height: `calc(100dvh + ${totalScrollVh}vh)` }}
        aria-hidden="true"
      />

      {/* Fixed stage — stays in viewport while user scrolls the spacer */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[1] h-[100dvh] overflow-hidden bg-[#070b12] text-white transition-opacity duration-500",
          !stageVisible && "pointer-events-none opacity-0"
        )}
        aria-hidden={!stageVisible}
      >
        {/* Image sequence canvas */}
        <motion.div
          style={{ scale: canvasScale }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <ScrollScrubCanvas
            scrollProgress={sequenceScrollProgress}
            className="size-full"
          />
          {/* Gradient overlays for text legibility */}
          <div className="absolute inset-0 bg-[#070b12]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/90 via-[#070b12]/50 to-[#070b12]/10 sm:from-[#070b12]/80 sm:via-[#070b12]/25 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/80 via-transparent to-[#070b12]/30" />
        </motion.div>

        {/* Hero text overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-full flex-col px-5 pt-20 sm:px-8 sm:pt-24 md:pt-28 lg:px-12"
          aria-label={t("ariaLabel")}
        >
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center"
          >
            <div className="w-full max-w-xl space-y-4 sm:space-y-6">
              <Badge
                variant="secondary"
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                {t("badge")}
              </Badge>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-balance font-heading font-bold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] text-[2rem] leading-[1.1] sm:text-display sm:tracking-display md:text-display-lg">
                  {t("title")}
                </h1>
                <p className="max-w-md text-pretty text-sm text-white/85 drop-shadow-sm sm:text-base md:text-lg">
                  {t("description")}
                </p>
              </div>
              <motion.div
                style={{ opacity: heroCtasOpacity }}
                className="flex flex-col gap-2 xs:flex-row xs:flex-wrap xs:gap-3"
              >
                <Link
                  href="/products"
                  className={cn(buttonVariants({ size: "lg" }), "w-full xs:w-auto")}
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full xs:w-auto border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  )}
                >
                  {t("secondaryCta")}
                </Link>
              </motion.div>
              <p className="text-[11px] text-white/50 sm:text-xs">
                {storeConfig.name} · {tCommon("storeDescription")}
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: heroTextOpacity }}
            className="mx-auto flex w-full max-w-7xl items-end justify-end pb-6 sm:pb-10"
          >
            <div className="flex flex-col items-end gap-1 text-white/50">
              <span className="text-[11px] sm:text-xs">
                {sequenceComplete ? t("scrollComplete") : t("scrollHint")}
              </span>
              <ChevronDownIcon
                className={cn("size-4", !sequenceComplete && "animate-bounce")}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories reveal — slides up after the sequence ends */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 z-20 flex min-h-0 items-center"
        style={{
          top: `calc(100dvh + ${categoriesTopVh}vh)`,
          y: categoriesY,
        }}
      >
        <div className="container pointer-events-auto w-full">
          {categoriesReveal}
        </div>
      </motion.div>
    </div>
  )
}
