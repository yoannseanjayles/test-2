import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Brand, Genre, ProductColor, Usage } from "@/lib/catalog/types";

/**
 * Schéma catalogue — 6.1 jalon 1 (modèle 6.0 §2), révisé par le pivot
 * baskets (D-053).
 *
 * L'axe de navigation est la **marque** (D-055) : `products.animal` a
 * disparu, `products.brand` porte l'axe et n'accepte que les valeurs du
 * référentiel `lib/catalog/brands`. `subcategory` porte l'usage.
 *
 * L'unité de stock est la **variante `(produit, coloris, pointure)`**
 * (D-054) : `product_sizes` — qui agrégeait deux coloris sur un même stock —
 * est remplacée par `product_variants`. Couleurs et détails restent en JSONB
 * tant que l'admin n'en a pas besoin en colonnes.
 */

export const categories = pgTable("categories", {
  brand: text("brand").$type<Brand>().notNull(),
  slug: text("slug").$type<Usage>().notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
}, (t) => [primaryKey({ columns: [t.brand, t.slug] })]);

export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  /** Axe de route et facette (D-055) — contraint au référentiel de marques. */
  brand: text("brand").$type<Brand>().notNull(),
  /** Usage — niveau sous-catégorie, unique par marque. */
  subcategory: text("subcategory").$type<Usage>().notNull(),
  price: integer("price").notNull(), // centimes TTC (H18)
  shortDescription: text("short_description").notNull(),
  curatorNote: text("curator_note").notNull(),
  material: text("material").notNull(),
  details: jsonb("details").$type<{ title: string; content: string }[]>().notNull(),
  colors: jsonb("colors").$type<ProductColor[]>().notNull(),
  /** Facette signature (D-056) — remplace le gabarit animal. */
  genres: jsonb("genres").$type<Genre[]>().notNull(),
  /** Conseil de chaussant affiché près du sélecteur de pointure (ST-3). */
  sizeAdvice: text("size_advice"),
  isNew: boolean("is_new").notNull().default(false),
  curatedRank: integer("curated_rank").notNull(),
  pairsWith: jsonb("pairs_with").$type<string[]>().notNull(),
  tone: text("tone").$type<"chalk" | "graphite" | "sand" | "signal">().notNull(),
  /** Photos fournisseur (import 7.1) — vides pour le catalogue curé (photos statiques). */
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  /** Traçabilité import (7.1) : référence article et page fournisseur d'origine. */
  supplierRef: text("supplier_ref"),
  sourceUrl: text("source_url"),
  /** Points clés fournisseur (import enrichi) — liste à puces sur la fiche. */
  features: jsonb("features").$type<string[]>().notNull().default([]),
  /** Caractéristiques techniques (import enrichi) — accordéon dédié. */
  specifications: jsonb("specifications").$type<{ label: string; value: string }[]>().notNull().default([]),
  /** Visibilité par champ sur la fiche publique (images, features, specifications) — true par défaut. */
  fieldVisibility: jsonb("field_visibility").$type<Record<string, boolean>>().notNull().default({}),
  /** Corbeille (P2 audit) : produit retiré de la vente, restaurable — jamais montré en boutique. */
  archived: boolean("archived").notNull().default(false),
});

/** Réglages boutique (7.1 jalon 4) — clé/valeur JSON (config livraison D-039). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

/** Guides éditoriaux (D-037) — en base depuis 7.1 jalon 4, éditables dans l'admin. */
export const guides = pgTable("guides", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  brand: text("brand").$type<Brand | "tous">().notNull(),
  pillar: boolean("pillar").notNull().default(false),
  readingMinutes: integer("reading_minutes").notNull().default(5),
  relatedSubcategories: jsonb("related_subcategories").$type<string[]>().notNull().default([]),
  author: jsonb("author").$type<{ name: string; role: string; reviewedBy: string; updated: string } | null>(),
  content: jsonb("content").$type<{ heading: string; paragraphs: string[] }[] | null>(),
});

/**
 * Unité de stock (D-054) — un coloris en 42 et le même modèle en 42 dans un
 * autre coloris sont deux lignes distinctes. C'est la clé sur laquelle porte
 * le décrément conditionnel de `lib/stock.ts` (correctif C-2).
 */
export const productVariants = pgTable("product_variants", {
  productSlug: text("product_slug").notNull().references(() => products.slug),
  color: text("color").notNull(),
  size: text("size").notNull(),
  stock: integer("stock").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.productSlug, t.color, t.size] })]);

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
