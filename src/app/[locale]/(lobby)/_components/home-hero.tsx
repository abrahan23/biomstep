"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { ChevronDownIcon } from "@radix-ui/react-icons"

import { storeConfig } from "@/config/store"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

interface HomeHeroProps {
  videoUrl?: string
}

/** Cuánto scroll (vh) hace falta por cada segundo de vídeo antes de salir del hero. */
const SCROLL_VH_PER_SECOND = 20
const MIN_SCROLL_TRACK_VH = 180
const DEFAULT_VIDEO_DURATION = 10

/** Fases del hero mapeadas al progreso del scroll (0–1). */
const PHASES = {
  anatomy: { start: 0, end: 0.38 },
  insole: { start: 0.32, end: 0.58 },
  footwear: { start: 0.52, end: 1 },
} as const

function phaseOpacity(progress: number, start: number, end: number) {
  const fade = 0.08
  if (progress < start - fade) return 0
  if (progress > end + fade) return 0
  if (progress < start) return (progress - (start - fade)) / fade
  if (progress > end) return 1 - (progress - end) / fade
  return 1
}

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  if (value <= inMin) return outMin
  if (value >= inMax) return outMax
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

interface ScrollScrubVideoProps {
  src: string
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]
  className?: string
  onDurationReady?: (duration: number) => void
}

function ScrollScrubVideo({
  src,
  scrollProgress,
  className,
  onDurationReady,
}: ScrollScrubVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const reduceMotion = useReducedMotion()
  const [ready, setReady] = React.useState(false)
  const rafRef = React.useRef<number | null>(null)
  const pendingProgress = React.useRef(0)

  const applyFrame = React.useCallback((progress: number) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return

    const clamped = Math.min(1, Math.max(0, progress))
    const targetTime =
      clamped >= 1
        ? Math.max(0, video.duration - 0.05)
        : clamped * video.duration

    if (Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime
    }
  }, [])

  useMotionValueEvent(scrollProgress, "change", (progress) => {
    if (reduceMotion) return

    pendingProgress.current = progress

    if (rafRef.current !== null) return

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      applyFrame(pendingProgress.current)
    })
  })

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (ready && !reduceMotion) {
      applyFrame(pendingProgress.current)
    }
  }, [ready, reduceMotion, applyFrame])

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className={className}
      onLoadedMetadata={(event) => {
        const video = event.currentTarget
        video.pause()
        setReady(true)
        onDurationReady?.(video.duration)
        if (!reduceMotion) {
          applyFrame(pendingProgress.current)
        }
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

function FootAnatomySvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M210 40 C170 40 150 80 148 130 L145 220 C120 240 95 280 88 330 C80 390 95 450 130 480 C165 505 210 510 250 495 C290 478 320 440 330 390 C340 340 325 280 300 240 C275 200 250 170 235 130 C225 95 240 40 210 40Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.15"
        fill="currentColor"
        fillOpacity="0.04"
      />
      <path
        d="M148 130 L145 220 M235 130 L228 210 M175 250 L160 360 M240 250 L255 370 M195 400 L210 470 M250 390 L265 455"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      <circle cx="175" cy="250" r="6" fill="currentColor" fillOpacity="0.7" />
      <circle cx="240" cy="250" r="6" fill="currentColor" fillOpacity="0.7" />
      <circle cx="195" cy="400" r="5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="250" cy="390" r="5" fill="currentColor" fillOpacity="0.6" />
      <path
        d="M130 480 C165 505 210 510 250 495"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
    </svg>
  )
}

function InsoleSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M120 300 C130 260 170 230 210 225 C260 218 310 240 330 290 C345 330 335 390 300 430 C265 465 210 475 165 455 C125 438 105 395 110 350 C112 330 115 315 120 300Z"
        fill="url(#insoleGradient)"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeOpacity="0.8"
      />
      <path
        d="M145 320 C170 300 195 292 220 290 C250 288 280 300 300 325"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="insoleGradient" x1="120" y1="225" x2="330" y2="455">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function SneakerSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M95 340 C110 300 150 270 205 262 C270 252 330 275 355 320 C375 355 370 410 335 445 C300 478 230 492 170 475 C120 462 90 420 88 375 C87 355 90 365 95 340Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.85"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <path
        d="M120 355 C160 330 210 322 260 330 C300 336 330 355 345 385"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <ellipse
        cx="210"
        cy="455"
        rx="95"
        ry="18"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
    </svg>
  )
}

export function HomeHero({ videoUrl }: HomeHeroProps) {
  const t = useTranslations("Home.hero")
  const tCommon = useTranslations("Common")
  const containerRef = React.useRef<HTMLElement>(null)
  const [videoDuration, setVideoDuration] = React.useState(DEFAULT_VIDEO_DURATION)

  const scrollTrackVh = videoUrl
    ? Math.max(MIN_SCROLL_TRACK_VH, Math.ceil(videoDuration * SCROLL_VH_PER_SECOND))
    : 140

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [heroVisible, setHeroVisible] = React.useState(true)

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrollProgress(value)
  })

  React.useEffect(() => {
    const updateHeroVisibility = () => {
      const section = containerRef.current
      if (!section) return

      setHeroVisible(section.getBoundingClientRect().bottom > 0)
    }

    updateHeroVisibility()
    window.addEventListener("scroll", updateHeroVisibility, { passive: true })
    window.addEventListener("resize", updateHeroVisibility)

    return () => {
      window.removeEventListener("scroll", updateHeroVisibility)
      window.removeEventListener("resize", updateHeroVisibility)
    }
  }, [scrollTrackVh, videoUrl])

  const contentYOffset = mapRange(scrollProgress, 0, 0.55, 0, -32)
  const contentOpacityValue = mapRange(scrollProgress, 0.88, 0.98, 1, 0)
  const videoScaleValue = mapRange(scrollProgress, 0, 1, 1, 1.08)

  const svgOverlayOpacity = videoUrl
    ? Math.max(0, 0.55 - scrollProgress * 0.7)
    : 1

  const anatomyOpacity = phaseOpacity(
    scrollProgress,
    PHASES.anatomy.start,
    PHASES.anatomy.end
  )
  const insoleOpacity = phaseOpacity(
    scrollProgress,
    PHASES.insole.start,
    PHASES.insole.end
  )
  const footwearOpacity = phaseOpacity(
    scrollProgress,
    PHASES.footwear.start,
    PHASES.footwear.end
  )

  const layers = {
    anatomy: t("layers.anatomy"),
    insole: t("layers.insole"),
    footwear: t("layers.footwear"),
  }

  const activePhase =
    scrollProgress < PHASES.insole.start
      ? layers.anatomy
      : scrollProgress < PHASES.footwear.start
        ? layers.insole
        : layers.footwear

  const videoComplete = scrollProgress >= 0.985

  return (
    <>
      <section
        ref={containerRef}
        className="relative w-full"
        style={
          videoUrl
            ? { height: `calc(100dvh + ${scrollTrackVh}vh)` }
            : { height: "240vh" }
        }
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[1] flex h-[100dvh] flex-col overflow-hidden bg-[#070b12] text-white transition-opacity duration-300",
          !heroVisible && "pointer-events-none opacity-0"
        )}
        aria-label={t("ariaLabel")}
        aria-hidden={!heroVisible}
      >
        {videoUrl ? (
          <motion.div
            style={{ scale: videoScaleValue }}
            className="pointer-events-none absolute inset-0 z-0"
          >
            <ScrollScrubVideo
              src={videoUrl}
              scrollProgress={scrollYProgress}
              onDurationReady={setVideoDuration}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-[#070b12]/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/90 via-[#070b12]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/80 via-transparent to-[#070b12]/30" />
          </motion.div>
        ) : (
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.22),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_40%)]" />
          </div>
        )}

        <div className="relative z-10 flex h-full flex-1 flex-col justify-between px-4 pb-8 pt-24 md:px-8 md:pb-10 md:pt-28 lg:px-12">
          <motion.div
            style={{ y: contentYOffset, opacity: contentOpacityValue }}
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center"
          >
            <div className="max-w-xl space-y-6">
              <Badge
                variant="secondary"
                className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-white backdrop-blur-sm"
              >
                {t("badge")}
              </Badge>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
                  {t("title")}
                </h1>
                <p className="max-w-lg text-pretty text-base text-white/85 drop-shadow-sm sm:text-lg">
                  {t("description")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  {t("secondaryCta")}
                </Link>
              </div>
              <p className="text-xs text-white/55">
                {storeConfig.name} · {tCommon("storeDescription")}
              </p>
            </div>
          </motion.div>

          <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4">
            {videoUrl ? (
              <div className="flex flex-col gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/70">
                <span className="text-primary">{activePhase}</span>
                <span className="tabular-nums text-white/45">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
            ) : (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm flex-1">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ opacity: svgOverlayOpacity }}
                >
                  <div
                    className="absolute inset-0 text-white/90"
                    style={{ opacity: anatomyOpacity }}
                  >
                    <FootAnatomySvg className="size-full drop-shadow-[0_0_40px_rgba(56,189,248,0.15)]" />
                  </div>
                  <div
                    className="absolute inset-0 text-primary"
                    style={{ opacity: insoleOpacity }}
                  >
                    <InsoleSvg className="size-full drop-shadow-[0_0_30px_hsl(var(--primary)/0.35)]" />
                  </div>
                  <div
                    className="absolute inset-0 text-white"
                    style={{ opacity: footwearOpacity }}
                  >
                    <SneakerSvg className="size-full" />
                  </div>
                </div>
              </div>
            )}

            {!videoUrl ? (
              <div className="hidden flex-col gap-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/50 sm:flex">
                <span
                  className={cn(
                    "transition-colors",
                    activePhase === layers.anatomy && "text-white"
                  )}
                >
                  {layers.anatomy}
                </span>
                <span
                  className={cn(
                    "transition-colors",
                    activePhase === layers.insole && "text-primary"
                  )}
                >
                  {layers.insole}
                </span>
                <span
                  className={cn(
                    "transition-colors",
                    activePhase === layers.footwear && "text-white"
                  )}
                >
                  {layers.footwear}
                </span>
              </div>
            ) : null}

            <motion.div
              style={{ opacity: contentOpacityValue }}
              className="ml-auto flex flex-col items-end gap-1 text-white/50 sm:items-center"
            >
              <span className="text-xs">
                {videoComplete ? t("scrollComplete") : t("scrollHint")}
              </span>
              <ChevronDownIcon
                className={cn("size-4", !videoComplete && "animate-bounce")}
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
