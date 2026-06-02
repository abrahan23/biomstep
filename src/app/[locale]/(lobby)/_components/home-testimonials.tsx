import { StarFilledIcon } from "@radix-ui/react-icons"
import { getTranslations } from "next-intl/server"

import { MotionShell } from "@/components/motion"

import { HomeSectionHeader } from "./home-section-header"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export async function HomeTestimonials() {
  const t = await getTranslations("Home.sections.testimonials")
  const items = t.raw("items") as Array<{
    quote: string
    author: string
    role: string
  }>
  const tCommon = await getTranslations("Common")

  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      aria-labelledby="home-testimonials-title"
    >
      <HomeSectionHeader
        sectionNumber="04"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        className="mb-12 md:mb-14"
        titleId="home-testimonials-title"
      />
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {items.map((item, index) => (
          <MotionShell key={item.author} delay={index * 100}>
            <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-[0_24px_50px_-20px_rgba(13,148,136,0.25)] md:p-8 dark:from-card dark:to-teal-950/10 dark:hover:shadow-[0_24px_50px_-20px_rgba(13,148,136,0.4)]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-6 font-heading text-8xl leading-none text-teal-500/[0.08] transition-colors duration-500 group-hover:text-teal-500/15 md:text-9xl"
              >
                “
              </span>
              <div className="relative mb-5 flex items-center justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-teal-200/70 bg-gradient-to-br from-teal-50 to-teal-100/50 font-mono text-xs font-semibold tracking-wide text-teal-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-teal-700/40 dark:from-teal-950/40 dark:to-teal-900/20 dark:text-teal-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  {getInitials(item.author)}
                </div>
                <div
                  className="flex gap-0.5"
                  aria-label={tCommon("starsRating", { rating: 5 })}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarFilledIcon
                      key={i}
                      className="size-3.5 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
              <blockquote className="relative flex-1 text-pretty text-[15px] leading-relaxed text-foreground md:text-base md:leading-[1.7]">
                {item.quote}
              </blockquote>
              <figcaption className="relative mt-6 border-t border-border/60 pt-5">
                <p className="text-sm font-semibold tracking-tight">{item.author}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.role}
                </p>
              </figcaption>
            </figure>
          </MotionShell>
        ))}
      </div>
    </section>
  )
}
