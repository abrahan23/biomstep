import type { FooterItem, MainNavItem } from "@/types"

export type SiteConfig = typeof siteConfig

const links = {
  x: "https://twitter.com/sadmann17",
  github: "https://github.com/sadmann7/skateshop",
  githubAccount: "https://github.com/sadmann7",
  discord: "https://discord.com/users/sadmann7",
  calDotCom: "https://cal.com/sadmann7",
}

export const blogMainNavItem = {
  title: "Blog",
  href: "/blog",
  description: "Read our latest blog posts.",
  items: [
    {
      title: "Todos",
      href: "/blog",
      description: "Blog de BIOMSTEP.",
      items: [],
    },
    {
      title: "Cirugía ",
      href: "/cirugia-de-pie",
      description: "Cirugía de pie.",
      items: [],
    },
  ],
} satisfies MainNavItem

export const siteConfig = {
  name: "Biomstep",
  description: "La tienda oficial de BIOMSTEP.",
  url: "https://biomstep.com",
  ogImage: "https://biomstep.com/opengraph-image.png",
  links,
  footerNav: [
    {
      title: "Categorías",
      items: [
        {
          title: "Plantillas",
          href: "/collections/insoles",
          external: false,
        },
        {
          title: "Protección deportiva",
          href: "/collections/sport-protection",
          external: false,
        },
        {
          title: "Modelos anatómicos",
          href: "/collections/anatomical-models",
          external: false,
        },
        {
          title: "BIOMSTEP Lab",
          href: "/collections/biomstep-lab",
          external: false,
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          title: "About",
          href: "/about",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
        {
          title: "Terms",
          href: "/terms",
          external: false,
        },
        {
          title: "Privacy",
          href: "/privacy",
          external: false,
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          title: "X",
          href: links.x,
          external: true,
        },
        {
          title: "GitHub",
          href: links.githubAccount,
          external: true,
        },
        {
          title: "Discord",
          href: links.discord,
          external: true,
        },
        {
          title: "cal.com",
          href: links.calDotCom,
          external: true,
        },
      ],
    },
    {
      title: "Lofi",
      items: [
        {
          title: "beats to study to",
          href: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
          external: true,
        },
        {
          title: "beats to chill to",
          href: "https://www.youtube.com/watch?v=rUxyKA_-grg",
          external: true,
        },
        {
          title: "a fresh start",
          href: "https://www.youtube.com/watch?v=rwionZbOryo",
          external: true,
        },
        {
          title: "coffee to go",
          href: "https://www.youtube.com/watch?v=2gliGzb2_1I",
          external: true,
        },
      ],
    },
  ] satisfies FooterItem[],
}
