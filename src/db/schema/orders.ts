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
import { type CheckoutItemSchema } from "@/lib/validations/cart"

import { addresses } from "./addresses"
import { stores } from "./stores"
import { lifecycleDates } from "./utils"

// @see: https://github.com/jackblatch/OneStopShop/blob/main/db/schema.ts
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    storeId: varchar("store_id", { length: 30 })
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    // Clerk user id of the customer who placed the order (when authenticated).
    userId: varchar("user_id", { length: 36 }),
    items: json("items").$type<CheckoutItemSchema[] | null>().default(null),
    quantity: integer("quantity"),
    amount: decimal("amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
    stripePaymentIntentStatus: text("stripe_payment_intent_status").notNull(),
    // Stripe Invoicing: hosted invoice generated for the order.
    stripeInvoiceId: text("stripe_invoice_id"),
    stripeInvoiceUrl: text("stripe_invoice_url"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    addressId: varchar("address_id", { length: 30 })
      .references(() => addresses.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => ({
    storeIdIdx: index("orders_store_id_idx").on(table.storeId),
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    addressIdIdx: index("orders_address_id_idx").on(table.addressId),
  })
)

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
