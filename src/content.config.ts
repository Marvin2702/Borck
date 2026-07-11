// =========================================================================
// Content Collections (Astro Content Layer)
// Apartments + Reviews als Markdown. Ein Apartment ändern = eine .md-Datei.
// Felder mit TODO (smoobu_id, price_from, size_qm, gallery) vom Auftraggeber
// nachzutragen — Schema ist tolerant (optional), Build bleibt grün.
// =========================================================================
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const apartments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apartments' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(99),
    persons: z.number(),
    bedrooms: z.number().optional(),
    size_qm: z.number().optional(),
    view: z.string(), // z. B. "Deichblick", "Meerblick"
    floor: z.string().optional(), // z. B. "Erdgeschoss"
    features: z.array(z.string()).default([]),
    dogFriendly: z.boolean().default(false),
    smoobu_id: z.string().optional(), // TODO: Smoobu-Objekt-ID
    price_from: z.number().optional(), // EUR/Nacht "ab" – TODO bestätigen
    accent: z.string().default('#2a8ca0'), // Edelstein-Akzentfarbe
    heroImage: z.string().optional(), // /images/... – sonst Gradient-Platzhalter
    gallery: z.array(z.string()).default([]),
    summary: z.string(),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5).default(5),
    date: z.string().optional(), // ISO YYYY-MM-DD – wird angezeigt + als datePublished ins JSON-LD übernommen
    apartment: z.string().optional(),
    source: z.string().optional(), // z. B. "Google-Bewertung" (Default aus i18n) – muss der echten Herkunft entsprechen
  }),
});

// Reiseführer / Content-Cluster (DE) – Long-Tail-SEO rund um Büsum.
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(99),
    teaser: z.string(),
    icon: z.string().default('📘'),
    updated: z.string().optional(),
    // Verlinkte Themen-Landingpages (pageKeys aus src/data/landing.ts).
    relatedLanding: z.array(z.string()).default([]),
  }),
});

export const collections = { apartments, reviews, guides };
