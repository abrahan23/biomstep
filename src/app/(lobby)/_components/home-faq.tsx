"use client"

import { homeContent } from "@/config/home"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { HomeSectionHeader } from "./home-section-header"

export function HomeFaq() {
  const { faq } = homeContent

  return (
    <section
      className="pb-16 pt-4 md:pb-24 lg:pb-28"
      aria-labelledby="home-faq-title"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <HomeSectionHeader
            eyebrow="Ayuda"
            title={faq.title}
            description={faq.description}
            titleId="home-faq-title"
          />
        </div>
        <div className="lg:col-span-8">
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-border/50"
          >
            {faq.items.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-b px-5 last:border-b-0 md:px-7"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline md:py-6 md:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground md:pb-6 md:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
