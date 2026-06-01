import { StarFilledIcon } from "@radix-ui/react-icons"

import { homeContent } from "@/config/home"
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

export function HomeTestimonials() {
  const { testimonials } = homeContent

  return (
    <section
      className="py-16 md:py-20 lg:py-24"
      aria-labelledby="home-testimonials-title"
    >
      <HomeSectionHeader
        sectionNumber="04"
        eyebrow="Confianza clínica"
        title={testimonials.title}
        description={testimonials.description}
        align="center"
        className="mb-12 md:mb-14"
        titleId="home-testimonials-title"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.items.map((item, index) => (
          <MotionShell key={item.author} delay={index * 100}>
            <figure className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-6 md:p-7">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-4 font-heading text-7xl leading-none text-teal-500/10 md:text-8xl"
              >
                “
              </span>
              <div className="relative mb-5 flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-muted/50 font-mono text-xs font-semibold tracking-wide">
                  {getInitials(item.author)}
                </div>
                <div
                  className="flex gap-0.5"
                  aria-label={`${item.rating} de 5 estrellas`}
                >
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <StarFilledIcon
                      key={i}
                      className="size-3.5 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
              <blockquote className="relative flex-1 text-pretty text-sm leading-relaxed text-foreground md:text-base md:leading-7">
                {item.quote}
              </blockquote>
              <figcaption className="relative mt-6 border-t border-border/60 pt-5">
                <p className="text-sm font-semibold">{item.author}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
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
