import { relations } from "drizzle-orm"
import {
  decimal,
  index,
  integer,
  json,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

import { generateId } from "@/lib/id"

import { products } from "./products"
import { lifecycleDates } from "./utils"

/**
 * An option type for a product (e.g. "Color", "Talla") together with the list
 * of possible values it can take (e.g. ["Azul", "Verde"]).
 */
export const productOptions = pgTable(
  "product_options",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    values: json("values").$type<string[]>().notNull().default([]),
    rank: integer("rank").notNull().default(0),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("product_options_product_id_idx").on(table.productId),
  })
)

export const productOptionsRelations = relations(productOptions, ({ one }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
}))

export type ProductOption = typeof productOptions.$inferSelect
export type NewProductOption = typeof productOptions.$inferInsert

/**
 * A concrete, sellable combination of option values (a SKU). The `options`
 * column maps an option id to the chosen value, e.g. { opt_color: "Azul",
 * opt_talla: "38" }, and each SKU carries its own price and inventory.
 */
export const productSkus = pgTable(
  "product_skus",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    options: json("options").$type<Record<string, string>>().notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
    inventory: integer("inventory").notNull().default(0),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("product_skus_product_id_idx").on(table.productId),
  })
)

export const productSkusRelations = relations(productSkus, ({ one }) => ({
  product: one(products, {
    fields: [productSkus.productId],
    references: [products.id],
  }),
}))

export type ProductSku = typeof productSkus.$inferSelect
export type NewProductSku = typeof productSkus.$inferInsert
