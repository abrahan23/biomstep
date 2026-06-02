"use client"

import * as React from "react"

/** Genera un poster JPEG desde un frame del vídeo (misma origen /public). */
function generatePosterFromVideo(src: string, onResult: (url: string | undefined) => void) {
  let cancelled = false
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "auto"
  video.src = src

  const capture = () => {
    if (cancelled || video.videoWidth === 0) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    onResult(canvas.toDataURL("image/jpeg", 0.82))
  }

  const onLoadedData = () => {
    if (video.readyState < 2) return
    const target = Math.min(0.5, Math.max(0, (video.duration || 1) * 0.02))
    if (Math.abs(video.currentTime - target) < 0.01) {
      capture()
      return
    }
    video.currentTime = target
  }

  video.addEventListener("loadeddata", onLoadedData)
  video.addEventListener("seeked", capture)
  video.addEventListener("error", () => {
    if (!cancelled) onResult(undefined)
  })
  video.load()

  return () => {
    cancelled = true
    video.removeEventListener("loadeddata", onLoadedData)
    video.removeEventListener("seeked", capture)
    video.src = ""
    video.load()
  }
}

export function useVideoPoster(src: string, staticPoster?: string) {
  const [posterUrl, setPosterUrl] = React.useState<string | undefined>()

  React.useEffect(() => {
    let cleanupVideo: (() => void) | undefined

    const runVideoCapture = () => {
      cleanupVideo?.()
      cleanupVideo = generatePosterFromVideo(src, setPosterUrl)
    }

    if (!staticPoster) {
      runVideoCapture()
      return () => cleanupVideo?.()
    }

    let cancelled = false
    const img = new Image()

    img.onload = () => {
      if (!cancelled) setPosterUrl(staticPoster)
    }
    img.onerror = () => {
      if (!cancelled) runVideoCapture()
    }
    img.src = staticPoster

    return () => {
      cancelled = true
      cleanupVideo?.()
    }
  }, [src, staticPoster])

  return posterUrl
}
