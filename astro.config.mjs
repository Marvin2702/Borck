// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Live-Domain für absolute URLs (Sitemap, hreflang, OpenGraph, JSON-LD).
const SITE = 'https://www.nordsee-buesum-fewo.de';

export default defineConfig({
  site: SITE,
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
    }),
  ],
});
