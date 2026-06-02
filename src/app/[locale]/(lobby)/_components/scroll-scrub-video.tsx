"use client"

import * as React from "react"
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"

import { useVideoPoster } from "./use-video-poster"

interface ScrollScrubVideoProps {
  src: string
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]
  poster?: string
  className?: string
  onDurationReady?: (duration: number) => void
}

export function ScrollScrubVideo({
  src,
  scrollProgress,
  poster,
  className,
  onDurationReady,
}: ScrollScrubVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const posterUrl = useVideoPoster(src, poster)
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
      poster={posterUrl}
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
