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
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de-DE',
          en: 'en-US',
          nl: 'nl-NL',
          da: 'da-DK',
        },
      },
      // DE-only Landingpages haben keine Sprachversionen -> keine hreflang-Alternates
      // in der Sitemap (sonst Verweise auf nicht existente /en|nl|da-Seiten).
      serialize(item) {
        if (item.url.includes('/ferienwohnung-buesum-')) delete item.links;
        return item;
      },
    }),
  ],
});
