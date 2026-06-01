import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HomeSectionHeaderProps {
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
      <div className={cn("max-w-2xl space-y-3", centered && "mx-auto")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className="text-balance text-3xl font-bold tracking-tight md:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {href && linkText ? (
        <Button
          variant="outline"
          className={cn("shrink-0 rounded-full px-5", centered && "mx-auto")}
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
