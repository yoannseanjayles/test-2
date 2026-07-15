import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Gabarit, ProductColor } from "@/lib/catalog/types";

/**
 * Schéma catalogue — 6.1 jalon 1 (modèle 6.0 §2). Les tailles (axe porteur
 * de stock) sont normalisées ; couleurs/détails restent en JSONB tant que
 * l'admin (Phase 7) n'en a pas besoin en colonnes.
 */

export const categories = pgTable("categories", {
  animal: text("animal").$type<"chien" | "chat" | "nac">().notNull(),
  slug: text("slug").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
}, (t) => [primaryKey({ columns: [t.animal, t.slug] })]);

export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  animal: text("animal").$type<"chien" | "chat" | "nac">().notNull(),
  subcategory: text("subcategory").notNull(),
  price: integer("price").notNull(), // centimes TTC (H18)
  shortDescription: text("short_description").notNull(),
  curatorNote: text("curator_note").notNull(),
  material: text("material").notNull(),
  details: jsonb("details").$type<{ title: string; content: string }[]>().notNull(),
  colors: jsonb("colors").$type<ProductColor[]>().notNull(),
  gabarits: jsonb("gabarits").$type<Gabarit[]>().notNull(),
  isNew: boolean("is_new").notNull().default(false),
  curatedRank: integer("curated_rank").notNull(),
  pairsWith: jsonb("pairs_with").$type<string[]>().notNull(),
  tone: text("tone").$type<"cream" | "sage" | "caramel" | "terracotta">().notNull(),
  /** Photos fournisseur (import 7.1) — vides pour le catalogue curé (photos statiques). */
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  /** Traçabilité import (7.1) : référence article et page fournisseur d'origine. */
  supplierRef: text("supplier_ref"),
  sourceUrl: text("source_url"),
});

export const productSizes = pgTable("product_sizes", {
  productSlug: text("product_slug").notNull().references(() => products.slug),
  name: text("name").notNull(),
  stock: integer("stock").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.productSlug, t.name] })]);

export const reviews = pgTable("reviews", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  productSlug: text("product_slug").notNull().references(() => products.slug),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  context: text("context").notNull(),
  date: text("date").notNull(),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
