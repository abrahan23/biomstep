import { homeContent } from "@/config/home"
import { Icons } from "@/components/icons"
import { MotionShell } from "@/components/motion"

import { HomeSectionHeader } from "./home-section-header"

const iconMap = {
  footprint: Icons.product,
  activity: Icons.activity,
  bone: Icons.logo,
  shield: Icons.credit,
} as const

export function HomeBenefits() {
  const { benefits } = homeContent

  return (
    <section
      className="relative overflow-hidden border-y bg-muted/30 py-16 md:py-20 lg:py-24"
      aria-labelledby="home-benefits-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-teal-500/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-blue-500/5 blur-3xl"
      />
      <div className="relative">
        <HomeSectionHeader
          eyebrow="Por qué BIOMSTEP"
          title={benefits.title}
          description={benefits.description}
          align="center"
          className="mb-12 md:mb-14"
          titleId="home-benefits-title"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          {benefits.items.map((item, index) => {
            const Icon = iconMap[item.icon]

            return (
              <MotionShell
                key={item.title}
                delay={index * 80}
                className="group rounded-2xl border bg-background/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-foreground/10 hover:shadow-md md:p-8"
              >
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-2 pt-0.5">
                    <h3 className="text-lg font-semibold tracking-tight md:text-xl">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
              </MotionShell>
            )
          })}
        </div>
      </div>
    </section>
  )
}
