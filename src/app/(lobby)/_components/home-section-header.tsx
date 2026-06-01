import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HomeSectionHeaderProps {
  sectionNumber?: string
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkText?: string
  className?: string
  align?: "left" | "center"
  titleId?: string
}

export function HomeSectionHeader({
  sectionNumber,
  eyebrow,
  title,
  description,
  href,
  linkText,
  className,
  align = "left",
  titleId,
}: HomeSectionHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        centered && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl space-y-4", centered && "mx-auto")}>
        {sectionNumber ? (
          <div
            className={cn(
              "flex items-center gap-3",
              centered && "justify-center"
            )}
          >
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-teal-600 dark:text-teal-400">
              {sectionNumber}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-12 bg-gradient-to-r from-teal-500/60 to-transparent sm:w-16"
            />
          </div>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700/80 dark:text-teal-400/90">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8">
            {description}
          </p>
        ) : null}
      </div>
      {href && linkText ? (
        <Button
          variant="outline"
          className={cn(
            "shrink-0 rounded-full border-teal-200/80 px-5 text-foreground hover:border-teal-300 hover:bg-teal-50/50 dark:border-teal-800 dark:hover:bg-teal-950/30",
            centered && "mx-auto"
          )}
          asChild
        >
          <Link href={href}>
            {linkText}
            <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
