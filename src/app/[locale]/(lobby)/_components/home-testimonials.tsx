import { getTranslations } from "next-intl/server"

import { HomeSectionHeader } from "./home-section-header"
import { StaggerTestimonials } from "./stagger-testimonials"

export async function HomeTestimonials() {
  const t = await getTranslations("Home.sections.testimonials")
  const tCommon = await getTranslations("Common")
  const items = t.raw("items") as Array<{
    quote: string
    author: string
    role: string
  }>

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
      <StaggerTestimonials
        items={items}
        starsLabel={tCommon("starsRating", { rating: 5 })}
      />
    </section>
  )
}
