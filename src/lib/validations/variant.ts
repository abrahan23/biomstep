import * as z from "zod"

export const productOptionSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Option name is required (e.g. Color, Talla)" })
    .max(50),
  values: z
    .array(z.string().min(1).max(50))
    .min(1, { message: "Add at least one value" }),
})

export const saveProductOptionsSchema = z.object({
  productId: z.string().min(1),
  options: z.array(productOptionSchema),
})

export const skuSchema = z.object({
  id: z.string().optional(),
  // Map of optionId -> chosen value (e.g. { opt_color: "Azul", opt_talla: "38" }).
  options: z.record(z.string(), z.string()),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid price" }),
  inventory: z.coerce
    .number()
    .int()
    .min(0, { message: "Inventory must be 0 or greater" }),
})

export const saveProductSkusSchema = z.object({
  productId: z.string().min(1),
  skus: z.array(skuSchema),
})

export const deleteProductSkuSchema = z.object({
  id: z.string().min(1),
})

export type ProductOptionSchema = z.infer<typeof productOptionSchema>
export type SaveProductOptionsSchema = z.infer<typeof saveProductOptionsSchema>
export type SkuSchema = z.infer<typeof skuSchema>
export type SaveProductSkusSchema = z.infer<typeof saveProductSkusSchema>
