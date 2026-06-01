import * as z from "zod"

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  subcategoryId: z.string().optional(),
  // Optional selected variant label (e.g. "Color: Azul, Talla: 38").
  variant: z.string().optional(),
  // Selected SKU id (concrete option combination) and its unit price.
  skuId: z.string().optional(),
  price: z.number().optional(),
})

export const checkoutItemSchema = cartItemSchema.extend({
  price: z.number(),
})

export const cartLineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
      })
    )
    .optional()
    .nullable(),
  category: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  inventory: z.number().default(0),
  quantity: z.number(),
  variant: z.string().optional().nullable(),
  skuId: z.string().optional().nullable(),
  storeId: z.string(),
  storeName: z.string().optional().nullable(),
  storeStripeAccountId: z.string().optional().nullable(),
})

export const deleteCartItemSchema = z.object({
  productId: z.string(),
  // When provided, only the line matching this variant is removed. Otherwise
  // every line for the product is removed (e.g. the board builder).
  variant: z.string().optional(),
})

export const deleteCartItemsSchema = z.object({
  productIds: z.array(z.string()),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().min(0).default(1),
})

export type CartItemSchema = z.infer<typeof cartItemSchema>
export type CheckoutItemSchema = z.infer<typeof checkoutItemSchema>
export type CartLineItemSchema = z.infer<typeof cartLineItemSchema>
export type DeleteCartItemSchema = z.infer<typeof deleteCartItemSchema>
export type DeleteCartItemsSchema = z.infer<typeof deleteCartItemsSchema>
export type UpdateCartItemSchema = z.infer<typeof updateCartItemSchema>
