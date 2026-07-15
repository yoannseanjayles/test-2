import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Tables Better Auth (schéma cœur documenté) + profil animal (D-015/D-036). */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").$type<"Admin" | "Ops" | "Catalogue" | "Éditorial">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Profil animal persisté (max 5, H24). */
export const pets = pgTable("pets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").$type<"chien" | "chat" | "nac">().notNull(),
  gabarit: text("gabarit").$type<"XS" | "S" | "M" | "L" | "XL">().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Commandes (D-016) — invité (e-mail) ou rattachée au compte (D-014). */
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  status: text("status").notNull().default("Payée"),
  address: text("address").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  paymentIntentId: text("payment_intent_id"),
  /** Motif du retour self-service (D-035) — renseigné au passage en « Retour en cours ». */
  returnReason: text("return_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderLines = pgTable("order_lines", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

/** Alertes de restock (H15) et newsletter (consentement horodaté, D-041). */
export const restockAlerts = pgTable("restock_alerts", {
  id: text("id").primaryKey(),
  productSlug: text("product_slug").notNull(),
  size: text("size").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: text("email").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Brouillons d'import AliExpress (D-052/H41) — jamais publiés directement. */
export const importDrafts = pgTable("import_drafts", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  title: text("title").notNull(),
  supplierPrice: integer("supplier_price"),
  images: jsonb("images").$type<string[]>().notNull(),
  sourceUrl: text("source_url"),
  supplierRef: text("supplier_ref"),
  description: text("description"),
  brand: text("brand"),
  specifications: jsonb("specifications").$type<{ label: string; value: string }[]>().notNull().default([]),
  /** Noms de variantes détectés (alt des vignettes SKU) — pré-remplissent les coloris. */
  variantNames: jsonb("variant_names").$type<string[]>().notNull().default([]),
  /** Note fournisseur affichée sur la page (usage interne, jamais publiée). */
  supplierRating: text("supplier_rating"),
  status: text("status").$type<"draft" | "published">().notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
