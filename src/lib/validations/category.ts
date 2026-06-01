import * as z from "zod"

const slugSchema = z
  .string()
  .min(1, "El slug es obligatorio")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  slug: slugSchema,
  description: z.string().optional(),
  image: z.string().optional(),
})

export const subcategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  slug: slugSchema,
  description: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
})

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
})

export type CategorySchema = z.infer<typeof categorySchema>
export type SubcategorySchema = z.infer<typeof subcategorySchema>
