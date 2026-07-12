// =========================================================================
// Typisierter Zugriff auf assets/content.json (generiert vom Export-Skript).
// Das Zod-Schema ist der Vertrag zwischen Website-Content und App: Drift
// (umbenannte Felder, neue Markdown-Konstrukte) fällt im Test auf — nicht
// erst beim Gast.
// =========================================================================
import { z } from 'zod';
import raw from '../assets/content.json';

const Span = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  href: z.string().optional(),
});

const Block = z.object({
  t: z.enum(['h2', 'h3', 'p', 'li']),
  spans: z.array(Span),
});

const Apartment = z.object({
  slug: z.string(),
  name: z.string(),
  persons: z.number(),
  bedrooms: z.number().nullable(),
  size_qm: z.number().nullable(),
  view: z.string(),
  floor: z.string().nullable(),
  features: z.array(z.string()),
  dogFriendly: z.boolean(),
  accent: z.string(),
  summary: z.string(),
  smoobuId: z.string().nullable(),
});

const Mood = z.object({
  id: z.string(),
  icon: z.string(),
  label: z.string(),
  teaser: z.string(),
});

const Activity = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  mood: z.array(z.string()).min(1),
  area: z.string(),
  description: z.string(),
  url: z.string().url(),
  indoor: z.boolean(),
  km: z.number().min(0).max(60),
  lat: z.number(),
  lng: z.number(),
});

const Guide = z.object({
  slug: z.string(),
  title: z.string(),
  teaser: z.string(),
  icon: z.string(),
  order: z.number(),
  category: z.enum(['outdoor', 'indoor', 'praktisch']),
  blocks: z.array(Block),
});

export const ContentSchema = z.object({
  moods: z.array(Mood).min(4),
  activities: z.array(Activity).min(20),
  site: z.object({
    name: z.string(),
    tagline: z.string(),
    phone: z.string(),
    phoneDisplay: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    geo: z.object({ lat: z.number(), lng: z.number() }),
    checkinTime: z.string(),
    checkoutTime: z.string(),
    googleProfileUrl: z.string(),
    bookingUrl: z.string(),
    websiteUrl: z.string(),
  }),
  apartments: z.array(Apartment).min(1),
  guides: z.array(Guide).min(1),
  orientation: z.array(z.object({ name: z.string(), km: z.number() })),
});

export type Content = z.infer<typeof ContentSchema>;
export type Apartment = z.infer<typeof Apartment>;
export type Guide = z.infer<typeof Guide>;
export type Block = z.infer<typeof Block>;
export type Mood = z.infer<typeof Mood>;
export type Activity = z.infer<typeof Activity>;

export const content: Content = ContentSchema.parse(raw);

export const apartmentBySlug = (slug: string | undefined) =>
  content.apartments.find((a) => a.slug === slug);

export const guideBySlug = (slug: string | undefined) =>
  content.guides.find((g) => g.slug === slug);

export const activityById = (id: string | undefined) =>
  content.activities.find((a) => a.id === id);

/** Deep-Link-Parsing: akzeptiert hausaquamarin://wohnung/{slug} und
 *  https://…/gast/{slug}; liefert den Slug nur, wenn er existiert. */
export const slugFromUrl = (url: string): string | null => {
  const m = url.match(/(?:wohnung|gast)\/([a-z-]+)/i);
  const slug = m?.[1]?.toLowerCase() ?? null;
  return slug && content.apartments.some((a) => a.slug === slug) ? slug : null;
};
