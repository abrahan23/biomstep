export const homeContent = {
  hero: {
    badge: "Podología · Deporte · Anatomía",
    title: "Cuida cada paso con precisión clínica",
    description:
      "Plantillas personalizadas, protección deportiva y modelos anatómicos impresos en 3D. Tecnología BIOMSTEP para una pisada más saludable.",
    primaryCta: "Ver catálogo",
    secondaryCta: "Explorar categorías",
    scrollHint: "Desplázate hasta el final del vídeo",
    layers: {
      anatomy: "Anatomía",
      insole: "Plantillas",
      footwear: "Deporte",
    },
    /** Prompt Higgsfield: pie transparente → plantilla → pie+plantilla dentro de zapatilla transparente. */
    higgsfieldPrompt:
      "Single continuous cinematic macro shot, side profile. Phase 1: elegant semi-transparent human foot with visible anatomical bones gently lands and presses onto a teal custom orthotic insole, natural weight transfer, skin like frosted glass. Phase 2: the foot AND the insole move together as one unit, organically sliding heel-to-toe into a premium semi-transparent running sneaker, shoe upper also translucent like glass so bones and insole remain visible inside, laces flex naturally as the fit completes. Seamless motion, no cuts, BIOMSTEP medical-tech aesthetic, soft teal and bone-white lighting, photorealistic product film, slow dolly in.",
    /** Vídeo local generado con Higgsfield; override con NEXT_PUBLIC_HERO_VIDEO_URL. */
    videoSrc: "/hero-biomstep.mp4?v=3",
  },
  sections: {
    categories: {
      title: "Categorías principales",
      description:
        "Encuentra la solución adecuada para tu pisada, tu deporte o tu clínica.",
    },
    bestSellers: {
      title: "Productos más vendidos",
      description: "Lo que más eligen nuestros clientes para mejorar confort y rendimiento.",
      href: "/products?sort=rating.desc",
      linkText: "Ver más vendidos",
    },
  },
  benefits: {
    title: "Beneficios BIOMSTEP",
    description:
      "Combinamos conocimiento podológico, materiales de calidad y fabricación avanzada.",
    items: [
      {
        title: "Análisis de pisada",
        description:
          "Plantillas diseñadas para corregir apoyos, reducir sobrecarga y mejorar la biomecánica en cada paso.",
        icon: "footprint" as const,
      },
      {
        title: "Rendimiento deportivo",
        description:
          "Protecciones y plantillas deportivas que absorben impacto sin perder sensibilidad ni estabilidad.",
        icon: "activity" as const,
      },
      {
        title: "Precisión anatómica",
        description:
          "Modelos 3D de referencia clínica para formación, planificación y comunicación con el paciente.",
        icon: "bone" as const,
      },
      {
        title: "Calidad certificada",
        description:
          "Materiales duraderos, procesos controlados y envío seguro a domicilio con pago protegido.",
        icon: "shield" as const,
      },
    ],
  },
  testimonials: {
    title: "Opiniones",
    description: "Profesionales y deportistas que confían en BIOMSTEP.",
    items: [
      {
        quote:
          "Las plantillas deportivas cambiaron mi sensación en carrera. Menos fatiga en metatarsos y mejor estabilidad en apoyo.",
        author: "Laura M.",
        role: "Corredora amateur",
        rating: 5,
      },
      {
        quote:
          "Los modelos anatómicos de pie son una herramienta excelente para explicar procedimientos a mis pacientes.",
        author: "Dr. García",
        role: "Podólogo clínico",
        rating: 5,
      },
      {
        quote:
          "Compré plantillas para hostelería y el confort en jornadas largas de pie es notable desde la primera semana.",
        author: "Carlos R.",
        role: "Cliente BIOMSTEP",
        rating: 5,
      },
    ],
  },
  faq: {
    title: "FAQ rápida",
    description: "Respuestas a las dudas más habituales antes de comprar.",
    items: [
      {
        question: "¿Cómo elijo la plantilla adecuada?",
        answer:
          "Revisa la categoría según tu uso (deporte, trabajo, descanso o infantil). Cada ficha incluye descripción y recomendaciones. Si tienes dudas clínicas, consulta con tu podólogo.",
      },
      {
        question: "¿Cuánto tarda el envío?",
        answer:
          "Procesamos los pedidos en 24–48 h laborables. Recibirás el seguimiento por email en cuanto salga de nuestro almacén.",
      },
      {
        question: "¿Puedo devolver un producto?",
        answer:
          "Sí, dispones de 14 días para devoluciones en productos sin uso personalizado. Consulta nuestra política de devoluciones para más detalle.",
      },
      {
        question: "¿Los modelos anatómicos son para uso clínico?",
        answer:
          "Están pensados como apoyo visual y formativo. No sustituyen diagnóstico ni planificación quirúrgica individual.",
      },
    ],
  },
} as const
