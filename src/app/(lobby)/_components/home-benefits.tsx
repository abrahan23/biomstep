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
      className="relative border-y border-border/60 bg-[hsl(40,20%,98%)] py-16 dark:bg-muted/20 md:py-20 lg:py-24"
      aria-labelledby="home-benefits-title"
    >
      <div className="relative">
        <HomeSectionHeader
          sectionNumber="03"
          eyebrow="Por qué BIOMSTEP"
          title={benefits.title}
          description={benefits.description}
          align="center"
          className="mb-12 md:mb-14"
          titleId="home-benefits-title"
        />
        <div className="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 md:grid-cols-2">
          {benefits.items.map((item, index) => {
            const Icon = iconMap[item.icon]
            const itemNumber = String(index + 1).padStart(2, "0")

            return (
              <MotionShell
                key={item.title}
                delay={index * 80}
                className="group bg-background p-6 transition-colors duration-300 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 md:p-8"
              >
                <div className="flex gap-5">
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <span className="font-mono text-[10px] font-medium tracking-widest text-teal-600/70 dark:text-teal-400/70">
                      {itemNumber}
                    </span>
                    <div className="flex size-11 items-center justify-center rounded-lg border border-teal-200/80 bg-teal-50/50 text-teal-700 transition-colors duration-300 group-hover:border-teal-300 group-hover:bg-teal-100/60 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-400">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="space-y-2 border-l border-border/60 pl-5 pt-0.5">
                    <h3 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7">
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
