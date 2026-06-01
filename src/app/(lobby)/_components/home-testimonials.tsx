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
            <figure className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-border/50 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {getInitials(item.author)}
                </div>
                <div
                  className="flex gap-0.5"
                  aria-label={`${item.rating} de 5 estrellas`}
                >
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <StarFilledIcon
                      key={i}
                      className="size-4 text-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
              <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-foreground md:text-base">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t pt-5">
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
