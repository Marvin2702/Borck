#!/usr/bin/env node
// =========================================================================
// Dist-Gate: prüft das Build-Ergebnis NACH dem Build (postbuild).
//
//   Staging   (PUBLIC_STAGING=true):  jede HTML-Seite MUSS noindex tragen
//                                     (schützt die Prod-Domain vor Duplicate
//                                     Content durch die GitHub-Pages-Kopie).
//   Produktion:                       KEINE Seite (außer 404) darf noindex
//                                     tragen; Canonicals/Sitemap müssen auf
//                                     die Produktions-Origin zeigen (nicht
//                                     auf *.github.io); hreflang-Gruppen
//                                     müssen vollständig sein.
// =========================================================================
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const staging = process.env.PUBLIC_STAGING === 'true';
// Muss der SITE-Logik aus astro.config.mjs entsprechen.
const origin = (process.env.SITE || 'https://www.nordsee-buesum-fewo.de').replace(/\/+$/, '');
const LOCALES = ['de', 'en', 'nl', 'da', 'x-default'];

if (!existsSync(dist)) {
  console.error('[check-dist] dist/ fehlt — zuerst bauen.');
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (entry.endsWith('.html')) yield p;
  }
}

const errors = [];
let pages = 0;

for (const file of htmlFiles(dist)) {
  const rel = relative(dist, file);
  const html = readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const is404 = rel === '404.html';
  pages++;

  if (staging) {
    if (!noindex) errors.push(`${rel}: STAGING-Build ohne noindex — würde die Prod-SEO gefährden`);
    continue;
  }

  // --- Produktions-Checks ---
  if (noindex && !is404) errors.push(`${rel}: noindex im PRODUKTIONS-Build`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) {
    if (!is404) errors.push(`${rel}: Canonical fehlt`);
  } else {
    if (/github\.io/.test(canonical)) errors.push(`${rel}: Canonical zeigt auf GitHub Pages (${canonical})`);
    if (!canonical.startsWith(`${origin}/`)) errors.push(`${rel}: Canonical (${canonical}) passt nicht zur SITE-Origin (${origin})`);
  }

  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  if (hreflangs.length > 0) {
    const langs = hreflangs.map((m) => m[1]);
    for (const l of LOCALES) {
      if (!langs.includes(l)) errors.push(`${rel}: hreflang-Gruppe unvollständig — '${l}' fehlt`);
    }
    for (const [, , href] of hreflangs) {
      if (!href.startsWith(`${origin}/`)) errors.push(`${rel}: hreflang-URL (${href}) passt nicht zur SITE-Origin`);
    }
  }
}

// Sitemap + robots (beide Modi: vorhanden; Prod zusätzlich: richtige Origin).
const sitemapIndex = join(dist, 'sitemap-index.xml');
if (!existsSync(sitemapIndex)) {
  errors.push('sitemap-index.xml fehlt');
} else if (!staging) {
  const sm = readFileSync(sitemapIndex, 'utf8');
  if (/github\.io/.test(sm)) errors.push('sitemap-index.xml enthält GitHub-Pages-URLs im PRODUKTIONS-Build');
  for (const entry of readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
    const xml = readFileSync(join(dist, entry), 'utf8');
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (!loc.startsWith(`${origin}/`)) errors.push(`${entry}: Sitemap-URL (${loc}) passt nicht zur SITE-Origin (${origin})`);
    }
    if (/404/.test(xml)) errors.push(`${entry}: Sitemap enthält eine 404-Seite`);
  }
}
const robots = join(dist, 'robots.txt');
if (!existsSync(robots)) {
  errors.push('robots.txt fehlt');
} else if (!staging && !readFileSync(robots, 'utf8').includes(`Sitemap: ${origin}/`)) {
  errors.push(`robots.txt: Sitemap-Zeile zeigt nicht auf ${origin}`);
}

const mode = staging ? 'STAGING' : 'PRODUKTION';
if (errors.length) {
  console.error(`\n[check-dist] BUILD-PRÜFUNG FEHLGESCHLAGEN (${mode}) — ${errors.length} Problem(e):`);
  for (const e of errors.slice(0, 50)) console.error(`  ✖ ${e}`);
  if (errors.length > 50) console.error(`  … und ${errors.length - 50} weitere`);
  console.error('');
  process.exit(1);
}
console.log(`[check-dist] OK (${mode}): ${pages} HTML-Seiten geprüft, Indexierung/Canonicals/Sitemap konsistent.`);
