// =========================================================================
// Exportiert Website-Inhalte in die Gäste-App: liest Apartments- und Guide-
// Markdown + site.ts des Astro-Projekts und schreibt assets/content.json
// (committed, damit EAS-Cloud-Builds sie sehen) sowie src/heroImages.ts
// (statische require()-Map) und kopiert die 640er-WebP-Hero-Bilder.
//
// Aufruf:  npm run export   (in app/; nutzt Node >=22.12 --experimental-strip-types)
// =========================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { site } from '../../src/data/site.ts';
import { experiences } from '../../src/data/experiences.ts';

const APP = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const ROOT = path.resolve(APP, '..');
const OUT_JSON = path.join(APP, 'assets/content.json');
const OUT_IMG = path.join(APP, 'assets/images');
const OUT_HERO_TS = path.join(APP, 'src/heroImages.ts');

// --- Apartments ----------------------------------------------------------
const aptDir = path.join(ROOT, 'src/content/apartments');
const apartments = fs
  .readdirSync(aptDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const { data } = matter.read(path.join(aptDir, f));
    return {
      slug,
      name: data.name,
      order: data.order ?? 99,
      persons: data.persons,
      bedrooms: data.bedrooms ?? null,
      size_qm: data.size_qm ?? null,
      view: data.view,
      floor: data.floor ?? null,
      features: data.features ?? [],
      dogFriendly: Boolean(data.dogFriendly),
      accent: data.accent,
      summary: data.summary,
      smoobuId: data.smoobu_id ?? null,
      heroImage: data.heroImage ?? null,
    };
  })
  .sort((a, b) => a.order - b.order);

// --- Guides: Markdown-Body -> typisierte Blöcke (nativ renderbar) ---------
// Unterstützt: h2/h3, Absätze, ul-Listen, bold/links inline. Bricht der
// Export bei neuen Konstrukten (Tabelle, Bild), fällt das hier auf — gewollt.
function inlineSpans(tokens) {
  const spans = [];
  for (const t of tokens ?? []) {
    if (t.type === 'text' || t.type === 'codespan') spans.push({ text: t.text });
    else if (t.type === 'strong') spans.push({ text: t.text, bold: true });
    else if (t.type === 'em') spans.push({ text: t.text, bold: true });
    else if (t.type === 'link') spans.push({ text: t.text, href: t.href });
    else if (t.tokens) spans.push(...inlineSpans(t.tokens));
    else throw new Error(`Guide-Inline-Token nicht unterstützt: ${t.type}`);
  }
  return spans;
}

function toBlocks(md) {
  const blocks = [];
  for (const tok of marked.lexer(md)) {
    if (tok.type === 'space') continue;
    if (tok.type === 'heading') {
      blocks.push({ t: tok.depth <= 2 ? 'h2' : 'h3', spans: inlineSpans(tok.tokens) });
    } else if (tok.type === 'paragraph') {
      blocks.push({ t: 'p', spans: inlineSpans(tok.tokens) });
    } else if (tok.type === 'list') {
      for (const item of tok.items) blocks.push({ t: 'li', spans: inlineSpans(item.tokens?.flatMap((x) => x.tokens ?? [x]) ?? []) });
    } else {
      throw new Error(`Guide-Block nicht unterstützt: ${tok.type}`);
    }
  }
  return blocks;
}

// Grobe Wetter-Kategorie für den „Was machen wir heute?"-Filter.
const guideCategory = (slug) =>
  slug.includes('schietwetter') ? 'indoor' : slug.includes('anreise') ? 'praktisch' : 'outdoor';

const guideDir = path.join(ROOT, 'src/content/guides');
const guides = fs
  .readdirSync(guideDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const { data, content } = matter.read(path.join(guideDir, f));
    return {
      slug,
      title: data.title,
      teaser: data.teaser,
      icon: data.icon ?? '📘',
      order: data.order ?? 99,
      category: guideCategory(slug),
      blocks: toBlocks(content.trim()),
    };
  })
  .sort((a, b) => a.order - b.order);

const hav = (a, b) => {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

// --- Erlebnisse für den „Entdecken"-Swiper ---------------------------------
// 6 Stimmungs-Kategorien (Moods) der Stimmungs-Runde; Erlebnisse tragen 1–2
// Moods (Kategorie-Mapping + gezielte Overrides). Die Runde GEWICHTET den
// Stapel nur — nichts wird hart weggefiltert.
const moods = [
  { id: 'wasser', icon: '🚢', label: 'Raus aufs Wasser', teaser: 'Kutter, Helgoland, Seehunde & Wellen' },
  { id: 'watt', icon: '🥾', label: 'Watt & Natur', teaser: 'Weltnaturerbe, Vögel und weiter Horizont' },
  { id: 'action', icon: '🎯', label: 'Action & Familie', teaser: 'Golf, Kart, Experimente, Seehunde füttern' },
  { id: 'kultur', icon: '🏛️', label: 'Kultur & Bummeln', teaser: 'Museen, Hafen, Altstadt und Leckereien' },
  { id: 'wellness', icon: '🧖', label: 'Wellness & Baden', teaser: 'Wellenbad, Sauna und Aufwärmen' },
  { id: 'strand', icon: '🏖️', label: 'Strandtag', teaser: 'Strandkorb, Lagune, Sonnenuntergang' },
];

const categoryMood = {
  'Natur & Strand': ['strand'],
  'Familie': ['action'],
  'Aktiv & Wasser': ['wasser'],
  'Natur & Watt': ['watt'],
  'Baden & Wellness': ['wellness'],
  'Museen & Indoor': ['kultur'],
  'Orte & Kultur': ['kultur'],
  'Aktiv & Familie': ['action'],
};
const moodOverrides = {
  'perlebucht-lagune': ['strand', 'action'],
  'wassersport-schule': ['wasser', 'action'],
  'hafen-leuchtturm': ['kultur', 'strand'],
  'deich-radtour': ['action', 'watt'],
  'sonnenuntergang-deich': ['strand', 'watt'],
  'fischbroetchen-hafen': ['kultur', 'strand'],
};

const seenIds = new Set();
const activities = experiences.map((e) => {
  if (!e.id || seenIds.has(e.id)) throw new Error(`Erlebnis ohne eindeutige id: ${e.name}`);
  seenIds.add(e.id);
  const mood = moodOverrides[e.id] ?? categoryMood[e.category];
  if (!mood) throw new Error(`Keine Mood-Zuordnung für Kategorie "${e.category}" (${e.id})`);
  return {
    id: e.id,
    name: e.name,
    icon: e.icon,
    mood,
    area: e.area,
    description: e.description,
    url: e.url,
    indoor: e.indoor,
    km: Math.round(hav(site.geo, { lat: e.coords[0], lng: e.coords[1] }) * 10) / 10,
    lat: e.coords[0],
    lng: e.coords[1],
  };
});

// --- Orientierungspunkte (Quelle: LocationView.astro; Koordinaten stabil) --
const points = [
  { name: 'Familienlagune Perlebucht', lat: 54.13723, lng: 8.83839 },
  { name: 'Deich & Wattenmeer', lat: 54.13585, lng: 8.84094 },
  { name: 'Wellenbad Meerzeit', lat: 54.1281385, lng: 8.8569203 },
  { name: 'Büsum Ortszentrum', lat: 54.1329, lng: 8.8586 },
  { name: 'Hafen & Leuchtturm', lat: 54.1206, lng: 8.8585 },
];
const orientation = points.map((p) => ({
  name: p.name,
  km: Math.round(hav(site.geo, p) * 10) / 10,
}));

// --- Hero-Bilder kopieren (640er WebP) + statische require()-Map ----------
fs.mkdirSync(OUT_IMG, { recursive: true });
// Nur von diesem Skript verwaltete Dateien entfernen. Sortierung macht den
// Cleanup unabhängig von der Dateisystem-Reihenfolge und damit reproduzierbar.
for (const file of fs.readdirSync(OUT_IMG).filter((name) => /^apt-[a-z0-9-]+\.webp$/i.test(name)).sort()) {
  fs.unlinkSync(path.join(OUT_IMG, file));
}
const heroLines = [];
for (const a of apartments) {
  if (!a.heroImage) continue;
  const base = a.heroImage.replace(/^\/images\//, '').replace(/\.(jpe?g|png|webp)$/i, '');
  const src = path.join(ROOT, 'public/images', `${base}-640.webp`);
  const destName = `apt-${a.slug}.webp`;
  fs.copyFileSync(src, path.join(OUT_IMG, destName));
  heroLines.push(`  '${a.slug}': require('../assets/images/${destName}'),`);
}
fs.writeFileSync(
  OUT_HERO_TS,
  `// GENERIERT von scripts/export-content.mjs — nicht von Hand editieren.\n` +
    `// Metro braucht statische require()-Pfade, daher diese Map.\n` +
    `export const heroImages: Record<string, number> = {\n${heroLines.join('\n')}\n};\n`
);

// --- content.json ----------------------------------------------------------
const content = {
  moods,
  activities,
  site: {
    name: site.name,
    tagline: site.tagline,
    phone: site.phone.replace(/\s/g, ''),
    phoneDisplay: site.phoneDisplay,
    whatsapp: site.whatsapp,
    email: site.email,
    street: site.address.street,
    postalCode: site.address.postalCode,
    city: site.address.city,
    geo: site.geo,
    checkinTime: site.checkinTime,
    checkoutTime: site.checkoutTime,
    googleProfileUrl: site.googleProfileUrl,
    bookingUrl: site.smoobuBookingPage,
    websiteUrl: site.domain,
  },
  apartments: apartments.map(({ heroImage, order, ...a }) => a),
  guides,
  orientation,
};
fs.writeFileSync(OUT_JSON, JSON.stringify(content, null, 2) + '\n');
console.log(
  `content.json: ${apartments.length} Apartments, ${guides.length} Guides, ${activities.length} Erlebnisse, ${orientation.length} Orte · heroImages.ts + ${heroLines.length} Bilder`
);
