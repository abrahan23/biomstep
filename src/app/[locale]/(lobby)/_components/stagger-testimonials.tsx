"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, StarFilledIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const CARD_W_DESKTOP = 365
const CARD_W_MOBILE = 290
const CARD_H_RATIO = 1.18
const CLIP_SIZE = 22
const VISIBLE_SIDES = 2

const CLIP_PATH = `polygon(
  ${CLIP_SIZE}px 0%,
  100% 0%,
  100% calc(100% - ${CLIP_SIZE}px),
  calc(100% - ${CLIP_SIZE}px) 100%,
  0% 100%,
  0% ${CLIP_SIZE}px
)`

interface TestimonialItem {
  quote: string
  author: string
  role: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

interface CardProps {
  item: TestimonialItem
  offset: number
  cardWidth: number
  cardHeight: number
  starsLabel: string
  onClick: () => void
}

function TestimonialCard({
  item,
  offset,
  cardWidth,
  cardHeight,
  starsLabel,
  onClick,
}: CardProps) {
  const absOffset = Math.abs(offset)
  if (absOffset > VISIBLE_SIDES) return null

  const isCenter = offset === 0
  // Alternate rotation direction for visual stagger rhythm
  const rotation = isCenter ? 0 : (absOffset % 2 === 0 ? -1 : 1) * (offset > 0 ? 5 : -5)
  const x = offset * cardWidth * 0.58
  const scale = isCenter ? 1 : 1 - absOffset * 0.09
  const zIndex = 10 - absOffset
  const opacity = absOffset > VISIBLE_SIDES ? 0 : 1

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Ver opinión de ${item.author}`}
      className="absolute cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(.25,.46,.45,.94)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
      style={{
        width: cardWidth,
        height: cardHeight,
        transform: `translateX(${x}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex,
        opacity,
        clipPath: CLIP_PATH,
        boxShadow: isCenter
          ? "0 32px 64px -16px rgba(0,0,0,0.38), 0 8px 32px -8px rgba(13,148,136,0.28)"
          : "0 4px 16px -4px rgba(0,0,0,0.12)",
      }}
    >
      <div
        className={cn(
          "flex h-full flex-col p-6 md:p-7",
          isCenter
            ? "bg-gradient-to-br from-teal-600 to-teal-800"
            : "border border-border/60 bg-card"
        )}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center font-mono text-xs font-semibold tracking-wide",
              isCenter
                ? "bg-white/15 text-white"
                : "border border-teal-200/70 bg-teal-50/70 text-teal-700 dark:border-teal-700/40 dark:bg-teal-950/40 dark:text-teal-300"
            )}
          >
            {getInitials(item.author)}
          </div>
          <div className="flex gap-0.5" aria-label={starsLabel}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarFilledIcon
                key={i}
                className={cn(
                  "size-3.5",
                  isCenter ? "text-white/70" : "text-teal-500 dark:text-teal-400"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Quote */}
        <blockquote
          className={cn(
            "flex-1 text-pretty text-[15px] leading-relaxed",
            isCenter ? "text-white/95" : "text-foreground"
          )}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div
          className={cn(
            "mt-5 border-t pt-4",
            isCenter ? "border-white/15" : "border-border/50"
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold tracking-tight",
              isCenter ? "text-white" : "text-foreground"
            )}
          >
            {item.author}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs",
              isCenter ? "text-white/55" : "text-muted-foreground"
            )}
          >
            {item.role}
          </p>
        </div>
      </div>
    </div>
  )
}

interface StaggerTestimonialsProps {
  items: TestimonialItem[]
  starsLabel: string
}

export function StaggerTestimonials({ items, starsLabel }: StaggerTestimonialsProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [cardWidth, setCardWidth] = React.useState(CARD_W_DESKTOP)
  const total = items.length

  React.useEffect(() => {
    const update = () =>
      setCardWidth(window.innerWidth < 640 ? CARD_W_MOBILE : CARD_W_DESKTOP)
    update()
    window.addEventListener("resize", update, { passive: true })
    return () => window.removeEventListener("resize", update)
  }, [])

  const cardHeight = Math.round(cardWidth * CARD_H_RATIO)
  const containerHeight = cardHeight + 80

  const prev = () => setActiveIndex((i) => (i - 1 + total) % total)
  const next = () => setActiveIndex((i) => (i + 1) % total)

  function getOffset(index: number) {
    let offset = index - activeIndex
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    return offset
  }

  return (
    <div className="w-full">
      {/* Stage */}
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{ height: containerHeight }}
      >
        {items.map((item, i) => (
          <TestimonialCard
            key={i}
            item={item}
            offset={getOffset(i)}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            starsLabel={starsLabel}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          aria-label="Opinión anterior"
          className="flex size-10 items-center justify-center border border-border/60 bg-background text-muted-foreground transition-colors hover:border-teal-500/50 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-teal-950/20 dark:hover:text-teal-300"
          style={{ clipPath: CLIP_PATH }}
        >
          <ChevronLeftIcon className="size-5" />
        </button>

        <span className="min-w-[4rem] text-center font-mono text-xs tabular-nums text-muted-foreground">
          {String(activeIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;
          {String(total).padStart(2, "0")}
        </span>

        <button
          onClick={next}
          aria-label="Siguiente opinión"
          className="flex size-10 items-center justify-center border border-border/60 bg-background text-muted-foreground transition-colors hover:border-teal-500/50 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-teal-950/20 dark:hover:text-teal-300"
          style={{ clipPath: CLIP_PATH }}
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}
