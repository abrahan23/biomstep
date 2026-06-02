import { getTranslations } from "next-intl/server"

import { Icons } from "@/components/icons"
import { MotionShell } from "@/components/motion"

import { HomeSectionHeader } from "./home-section-header"

const iconMap = {
  footprint: Icons.product,
  activity: Icons.activity,
  bone: Icons.logo,
  shield: Icons.credit,
} as const

const iconKeys = ["footprint", "activity", "bone", "shield"] as const

export async function HomeBenefits() {
  const t = await getTranslations("Home.sections.benefits")
  const items = t.raw("items") as Array<{
    title: string
    description: string
  }>

  return (
    <section
      className="relative py-20 md:py-24 lg:py-28"
      aria-labelledby="home-benefits-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <div className="absolute left-1/2 top-0 -z-10 size-[640px] -translate-x-1/2 rounded-full bg-teal-500/[0.04] blur-3xl dark:bg-teal-400/[0.06]" />
      </div>

      <div className="relative">
        <HomeSectionHeader
          sectionNumber="03"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          align="center"
          className="mb-14 md:mb-16"
          titleId="home-benefits-title"
        />

        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 md:gap-6">
          {items.map((item, index) => {
            const Icon = iconMap[iconKeys[index] ?? "footprint"]
            const itemNumber = String(index + 1).padStart(2, "0")

            return (
              <MotionShell
                key={item.title}
                delay={index * 80}
                className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-[0_24px_60px_-20px_rgba(13,148,136,0.25)] md:p-8 dark:from-background dark:to-teal-950/10 dark:hover:shadow-[0_24px_60px_-20px_rgba(13,148,136,0.35)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-teal-400/0 blur-3xl transition-colors duration-500 group-hover:bg-teal-400/15"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-500 group-hover:scale-105 group-hover:border-teal-300 group-hover:shadow-[0_8px_20px_-6px_rgba(13,148,136,0.35)] dark:border-teal-700/40 dark:from-teal-950/40 dark:to-teal-900/20 dark:text-teal-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-teal-700/60 dark:text-teal-400/60">
                    {itemNumber}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col gap-2.5">
                  <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    {item.title}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-7">
                    {item.description}
                  </p>
                </div>
              </MotionShell>
            )
          })}
        </div>
      </div>
    </section>
  )
}
