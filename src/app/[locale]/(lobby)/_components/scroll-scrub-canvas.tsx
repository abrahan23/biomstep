"use client"

import * as React from "react"
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion"

const TOTAL_FRAMES = 141

function getFrameSrc(index: number): string {
  const num = String(index + 1).padStart(3, "0")
  return `/images/hero/ezgif-frame-${num}.jpg`
}

interface ScrollScrubCanvasProps {
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]
  className?: string
}

export function ScrollScrubCanvas({
  scrollProgress,
  className,
}: ScrollScrubCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  const framesRef = React.useRef<Array<HTMLImageElement | null>>(
    new Array(TOTAL_FRAMES).fill(null)
  )
  const currentFrameRef = React.useRef(0)
  const pendingProgressRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)

  const drawFrame = React.useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = framesRef.current[index]
    if (!img?.complete || !img.naturalWidth) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch

    let sx = 0,
      sy = 0,
      sw = img.naturalWidth,
      sh = img.naturalHeight
    if (ir > cr) {
      sw = img.naturalHeight * cr
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / cr
      sy = (img.naturalHeight - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
  }, [])

  const goToProgress = React.useCallback(
    (progress: number) => {
      const index = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * TOTAL_FRAMES))
      )
      currentFrameRef.current = index
      drawFrame(index)
    },
    [drawFrame]
  )

  useMotionValueEvent(scrollProgress, "change", (progress) => {
    if (reduceMotion) return
    pendingProgressRef.current = progress
    if (rafRef.current !== null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      goToProgress(pendingProgressRef.current)
    })
  })

  // Canvas size — mirrors the CSS size in device pixels
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      drawFrame(currentFrameRef.current)
    }

    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [drawFrame])

  // Preload all frames; first frame has priority
  React.useEffect(() => {
    const load = (index: number) => {
      const img = new Image()
      img.onload = () => {
        framesRef.current[index] = img
        if (index === currentFrameRef.current) drawFrame(index)
      }
      img.src = getFrameSrc(index)
    }

    load(0)
    for (let i = 1; i < TOTAL_FRAMES; i++) load(i)
  }, [drawFrame])

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
