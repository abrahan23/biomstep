"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion"
import { ChevronDownIcon } from "@radix-ui/react-icons"

import { storeConfig } from "@/config/store"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

import { mapRange } from "./home-scroll-utils"
import { ScrollScrubVideo } from "./scroll-scrub-video"

const SCROLL_VH_PER_SECOND = 20
const MIN_SCROLL_TRACK_VH = 180
const DEFAULT_VIDEO_DURATION = 10
/** Altura extra de scroll para revelar categorías sobre el vídeo. */
const CATEGORIES_REVEAL_VH = 55
interface HomeIntroScrollProps {
  videoUrl?: string
  categoriesReveal: React.ReactNode
}

export function HomeIntroScroll({
  videoUrl,
  categoriesReveal,
}: HomeIntroScrollProps) {
  const t = useTranslations("Home.hero")
  const tCommon = useTranslations("Common")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [videoDuration, setVideoDuration] = React.useState(DEFAULT_VIDEO_DURATION)

  const videoScrollVh = videoUrl
    ? Math.max(MIN_SCROLL_TRACK_VH, Math.ceil(videoDuration * SCROLL_VH_PER_SECOND))
    : 140

  const totalScrollVh = videoUrl
    ? videoScrollVh + CATEGORIES_REVEAL_VH
    : 140 + CATEGORIES_REVEAL_VH

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const videoPhaseEnd = videoScrollVh / totalScrollVh
  const videoScrollProgress = useTransform(scrollYProgress, (value) =>
    Math.min(1, value / videoPhaseEnd)
  )

  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [stageVisible, setStageVisible] = React.useState(true)

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrollProgress(value)
  })

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
  }, [totalScrollVh, videoUrl])

  const categoriesPhaseEnd =
    (videoScrollVh + CATEGORIES_REVEAL_VH) / totalScrollVh

  const heroRiseStart = videoPhaseEnd * 0.22
  const heroRiseEnd = videoPhaseEnd * 0.46
  const heroFadeStart = videoPhaseEnd * 0.44
  const heroFadeEnd = videoPhaseEnd * 0.56

  const categoriesStart = videoPhaseEnd * 0.52
  const categoriesEnd = categoriesPhaseEnd * 0.9

  const heroTextY = mapRange(scrollProgress, heroRiseStart, heroRiseEnd, 0, -280)
  const heroTextOpacity = mapRange(scrollProgress, heroFadeStart, heroFadeEnd, 1, 0)
  const heroCtasOpacity = mapRange(scrollProgress, heroFadeStart * 0.95, heroFadeEnd, 1, 0)
  const videoScaleValue = mapRange(
    Math.min(1, scrollProgress / videoPhaseEnd),
    0,
    1,
    1,
    1.06
  )
  const categoriesY = mapRange(scrollProgress, categoriesStart, categoriesEnd, 72, 0)

  const videoComplete = scrollProgress >= videoPhaseEnd * 0.98

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        className="relative w-full"
        style={{ height: `calc(100dvh + ${totalScrollVh}vh)` }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[1] h-[100dvh] overflow-hidden bg-[#070b12] text-white transition-opacity duration-500",
          !stageVisible && "pointer-events-none opacity-0"
        )}
        aria-hidden={!stageVisible}
      >
        {videoUrl ? (
          <motion.div
            style={{ scale: videoScaleValue }}
            className="pointer-events-none absolute inset-0 z-0"
          >
            <ScrollScrubVideo
              src={videoUrl}
              scrollProgress={videoScrollProgress}
              onDurationReady={setVideoDuration}
              className="size-full object-cover"
            />
          </motion.div>
        ) : (
          <div className="pointer-events-none absolute inset-0 z-0 bg-[#070b12]" />
        )}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-full flex-col px-4 pt-24 md:px-8 md:pt-28 lg:px-12"
          aria-label={t("ariaLabel")}
        >
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center"
          >
            <div className="max-w-xl space-y-6">
              <Badge
                variant="secondary"
                className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-white backdrop-blur-md"
              >
                {t("badge")}
              </Badge>
              <div className="space-y-4">
                <h1 className="font-heading text-balance text-display font-bold tracking-display drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-display-lg">
                  {t("title")}
                </h1>
                <p className="max-w-lg text-pretty text-base text-white/90 drop-shadow-sm sm:text-lg">
                  {t("description")}
                </p>
              </div>
              <motion.div
                style={{ opacity: heroCtasOpacity }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  href="/products"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  )}
                >
                  {t("secondaryCta")}
                </Link>
              </motion.div>
              <p className="text-xs text-white/60">
                {storeConfig.name} · {tCommon("storeDescription")}
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: heroTextOpacity }}
            className="mx-auto flex w-full max-w-7xl items-end justify-end pb-8 md:pb-10"
          >
            <div className="flex flex-col items-end gap-1 text-white/55">
              <span className="text-xs">
                {videoComplete ? t("scrollComplete") : t("scrollHint")}
              </span>
              <ChevronDownIcon
                className={cn("size-4", !videoComplete && "animate-bounce")}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 z-20 flex min-h-0 items-center"
        style={{
          top: `calc(100dvh + ${Math.round(videoScrollVh * 0.32)}vh)`,
          y: categoriesY,
        }}
      >
        <div className="pointer-events-auto container w-full">
          {categoriesReveal}
        </div>
      </motion.div>

    </div>
  )
}
