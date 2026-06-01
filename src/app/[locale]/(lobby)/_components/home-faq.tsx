"use client"

import { useTranslations } from "next-intl"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { HomeSectionHeader } from "./home-section-header"

export function HomeFaq() {
  const t = useTranslations("Home.sections.faq")
  const items = t.raw("items") as Array<{
    question: string
    answer: string
  }>

  return (
    <section
      className="pb-16 pt-4 md:pb-24 lg:pb-28"
      aria-labelledby="home-faq-title"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <HomeSectionHeader
            sectionNumber="05"
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
            titleId="home-faq-title"
          />
        </div>
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((item, index) => {
              const itemNumber = String(index + 1).padStart(2, "0")

              return (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="overflow-hidden rounded-xl border border-border/60 bg-card px-0 data-[state=open]:border-teal-500/25"
                >
                  <AccordionTrigger className="gap-4 px-5 py-5 text-left hover:no-underline md:px-6 md:py-6 [&[data-state=open]>span:first-child]:text-teal-600 dark:[&[data-state=open]>span:first-child]:text-teal-400">
                    <span className="shrink-0 font-mono text-[11px] font-medium tracking-widest text-muted-foreground transition-colors">
                      {itemNumber}
                    </span>
                    <span className="flex-1 text-base font-medium md:text-lg">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border/40 px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed text-muted-foreground md:px-6 md:pb-6 md:pl-[3.5rem] md:text-base md:leading-7">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
