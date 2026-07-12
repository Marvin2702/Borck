// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Live-Domain für absolute URLs (Sitemap, hreflang, OpenGraph, JSON-LD).
// SITE/BASE per Env überschreibbar: GitHub Pages (Unterpfad) setzt sie im
// Workflow; ohne Env greift die Produktions-Domain am Root.
const SITE = process.env.SITE || 'https://www.nordsee-buesum-fewo.de';
const BASE = process.env.BASE || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  // Die kleinen komponentenweisen Stylesheets blockierten im mobilen Lab den
  // Detailseiten-LCP. Bei diesem Projekt ist Inlining günstiger als mehrere
  // zusätzliche CSS-Roundtrips.
  build: { inlineStylesheets: 'always' },
  // Mehrsprachigkeit: DE = Root, EN/NL/DA mit Sprach-Präfix.
  // Architektur sprach-agnostisch — weitere Locales sind ein 1-Zeilen-Eintrag.
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'nl', 'da'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // Bestätigungsseiten sind absichtlich noindex und gehören nicht in die Sitemap.
      filter: (page) => !new URL(page).pathname.endsWith('/danke/'),
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de',
          en: 'en',
          nl: 'nl',
          da: 'da',
        },
      },
    }),
  ],
});
