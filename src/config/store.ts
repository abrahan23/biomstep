/**
 * Single-store e-commerce configuration.
 *
 * This app was refactored from a multi-vendor marketplace into a single-store
 * e-commerce. Instead of letting users create their own stores, the whole app
 * operates on one canonical store identified by `STORE_ID`. The seed script
 * inserts this exact row, and every admin/storefront query is scoped to it.
 */
export const storeConfig = {
  id: "str_default00000",
  slug: "default",
  name: "BIOMSTEP",
  description: "La tienda oficial de BIOMSTEP.",
} as const

export const STORE_ID = storeConfig.id
