export const homeConfig = {
  hero: {
    /** Prompt Higgsfield: pie transparente → plantilla → pie+plantilla dentro de zapatilla transparente. */
    higgsfieldPrompt:
      "Single continuous cinematic macro shot, side profile. Phase 1: elegant semi-transparent human foot with visible anatomical bones gently lands and presses onto a teal custom orthotic insole, natural weight transfer, skin like frosted glass. Phase 2: the foot AND the insole move together as one unit, organically sliding heel-to-toe into a premium semi-transparent running sneaker, shoe upper also translucent like glass so bones and insole remain visible inside, laces flex naturally as the fit completes. Seamless motion, no cuts, BIOMSTEP medical-tech aesthetic, soft teal and bone-white lighting, photorealistic product film, slow dolly in.",
    /** Vídeo local generado con Higgsfield; override con NEXT_PUBLIC_HERO_VIDEO_URL. */
    videoSrc: "/hero-biomstep.mp4?v=3",
  },
  sections: {
    bestSellers: {
      href: "/products?sort=rating.desc",
    },
  },
} as const

/** @deprecated Use next-intl messages under Home.* */
export const homeContent = homeConfig
