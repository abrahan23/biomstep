import type { Category, Subcategory } from "@/db/schema"

type CatalogSeedSubcategory = Omit<
  Subcategory,
  "slug" | "categoryId" | "createdAt" | "updatedAt" | "sortOrder"
> & {
  slug: string
}

type CatalogSeedCategory = Pick<
  Category,
  "id" | "name" | "description" | "image"
> & {
  slug: string
  subcategories: CatalogSeedSubcategory[]
}

/**
 * Datos iniciales del catálogo. Solo se usa al sembrar/sincronizar la BD.
 * En runtime, categorías y subcategorías se leen siempre de la base de datos.
 */
export const catalogSeed = {
  categories: [
    {
      id: "o7NjB0YzQFSo",
      name: "Plantillas",
      slug: "plantillas",
      description: "Plantillas para el ayudar terminados en uso",
      image: "/images/categories/skateboard-one.webp",
      subcategories: [
        {
          id: "xrsVByrhapog",
          name: "Deportivas",
          slug: "deportivas",
          description: "Pantillas deportivas para evitar lesiones",
        },
        {
          id: "DbHmQKrgUo3y",
          name: "Trabajo",
          slug: "trabajo",
          description: "Pantillas para el trabajo.",
        },
        {
          id: "DblKxtLQccq0",
          name: "Descanso",
          slug: "descanso",
          description: "Pantillas para el descanso.",
        },
        {
          id: "ynyX80mu2Wsm",
          name: "Infantiles",
          slug: "infantiles",
          description: "Pantillas infantiles para los niños.",
        },
      ],
    },
    {
      id: "blfYrJlCiDzm",
      name: "Protecciones deportivas",
      slug: "protecciones-deportivas",
      description: "Protecciones deportivas para evitar lesiones",
      image: "/images/categories/clothing-one.webp",
      subcategories: [],
    },
    {
      id: "R5mTrxqGJcz4",
      name: "Modelos anatómicos",
      slug: "modelos-anatomicos",
      description: "Modelos anatómicos impresos en 3D",
      image: "/images/categories/shoes-one.webp",
      subcategories: [
        {
          id: "zgXEW7zQ64LS",
          name: "Pies anatómicos",
          slug: "pies-anatomicos",
          description: "Modelos anatómicos para la cirugía de pie",
        },
      ],
    },
    {
      id: "N8rBWDyRzCR0",
      name: "Biomstep Lab",
      slug: "biomstep-lab",
      description: "Productos de BIOMSTEP Lab.",
      image: "/images/categories/backpack-one.webp",
      subcategories: [
        {
          id: "mkgq1FEEX0Mr",
          name: "Accesorios",
          slug: "accesorios",
          description: "Accesorios podológicos.",
        },
        {
          id: "iDAmxJD5qxCv",
          name: "Herramientas clínicas",
          slug: "herramientas-clinicas",
          description: "Herramientas clínicas pie.",
        },
        {
          id: "U0FuV4raZxEq",
          name: "Prototipos",
          slug: "prototipos",
          description: "Prototipos de pie.",
        },
      ],
    },
  ] satisfies CatalogSeedCategory[],
} satisfies { categories: CatalogSeedCategory[] }

export const catalogSeedSubcategoryIds = catalogSeed.categories.flatMap(
  (category) => category.subcategories.map((subcategory) => subcategory.id)
)
