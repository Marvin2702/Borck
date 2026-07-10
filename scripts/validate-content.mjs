#!/usr/bin/env node
// =========================================================================
// Content-Gate: prüft geschäftskritische Apartment-Pflichtfelder VOR dem Build.
//
//   Staging   (PUBLIC_STAGING=true):  Verstöße werden als WARNUNG gelistet,
//                                     der Build läuft weiter.
//   Produktion (alles andere):        Der Build bricht mit einer klaren
//                                     Fehlerliste ab (Apartment + Feld).
//
// Pflichtfelder: name, persons, summary, view, smoobu_id, heroImage,
// gallery (>= 1 vorhandenes Bild), size_qm sowie ein "ab"-Preis
// (price_from im Frontmatter ODER Eintrag in src/data/prices.json).
// Bewusst ohne YAML-Dependency: die Frontmatter dieses Repos ist flach.
// =========================================================================
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const aptDir = join(root, 'src/content/apartments');
const publicDir = join(root, 'public');
const prices = JSON.parse(readFileSync(join(root, 'src/data/prices.json'), 'utf8'));
const staging = process.env.PUBLIC_STAGING === 'true';

/** Flaches Frontmatter parsen: `key: value`-Skalare und `key:`-Listen mit `- item`. */
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && listKey) {
      data[listKey].push(listItem[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === '') {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = raw.trim().replace(/^["']|["']$/g, '');
      listKey = null;
    }
  }
  return data;
}

const errors = [];
const warnings = [];

const files = readdirSync(aptDir).filter((f) => f.endsWith('.md')).sort();
for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const fm = parseFrontmatter(readFileSync(join(aptDir, file), 'utf8'));
  if (!fm) {
    errors.push(`${slug}: Frontmatter fehlt oder ist nicht lesbar`);
    continue;
  }
  const missing = (field, hint = '') =>
    errors.push(`${slug}: Pflichtfeld '${field}' fehlt${hint ? ` (${hint})` : ''}`);

  if (!fm.name) missing('name');
  if (!fm.persons || Number.isNaN(Number(fm.persons)) || Number(fm.persons) <= 0) missing('persons');
  if (!fm.summary) missing('summary');
  if (!fm.view) missing('view');
  if (!fm.smoobu_id) missing('smoobu_id', 'Buchungs-ID — ohne sie kein Buchungskalender');
  if (!fm.size_qm || Number.isNaN(Number(fm.size_qm)) || Number(fm.size_qm) <= 0) {
    missing('size_qm', 'Wohnfläche in m² — bitte vom Betreiber nachtragen');
  }

  if (!fm.heroImage) {
    missing('heroImage');
  } else if (!existsSync(join(publicDir, fm.heroImage))) {
    errors.push(`${slug}: heroImage '${fm.heroImage}' existiert nicht unter public/`);
  }

  const gallery = Array.isArray(fm.gallery) ? fm.gallery : [];
  if (gallery.length === 0) {
    missing('gallery', 'mindestens 1 Bild erforderlich');
  } else {
    for (const g of gallery) {
      if (!existsSync(join(publicDir, g))) errors.push(`${slug}: Galerie-Bild '${g}' existiert nicht unter public/`);
    }
    if (gallery.length < 2) warnings.push(`${slug}: Galerie hat nur ${gallery.length} Bild — 2+ empfohlen`);
  }

  const hasPrice = (fm.smoobu_id && typeof prices[fm.smoobu_id] === 'number') || fm.price_from;
  if (!hasPrice) missing('price_from', `kein "ab"-Preis: weder price_from noch prices.json-Eintrag für smoobu_id '${fm.smoobu_id ?? '—'}'`);
}

// Hinweis (kein Blocker): Kontaktformular-Key — ohne ihn wird das Formular als
// "nicht verfügbar" gerendert (siehe ContactView.astro).
const siteTs = readFileSync(join(root, 'src/data/site.ts'), 'utf8');
if (/formAccessKey:\s*''/.test(siteTs)) {
  warnings.push(`site.ts: formAccessKey ist leer — das Kontaktformular wird als "nicht verfügbar" angezeigt (Web3Forms-Key eintragen)`);
}

const mode = staging ? 'STAGING' : 'PRODUKTION';
if (warnings.length) {
  console.warn(`\n[validate-content] Hinweise (${mode}):`);
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}
if (errors.length) {
  if (staging) {
    console.warn(`\n[validate-content] ${errors.length} Pflichtfeld-Problem(e) — im STAGING nur Warnung:`);
    for (const e of errors) console.warn(`  ⚠ ${e}`);
    console.warn('');
  } else {
    console.error(`\n[validate-content] PRODUKTIONS-BUILD ABGEBROCHEN — ${errors.length} Pflichtfeld-Problem(e):`);
    for (const e of errors) console.error(`  ✖ ${e}`);
    console.error('\nFehlende Daten nachtragen (src/content/apartments/*.md) oder Staging-Build nutzen (PUBLIC_STAGING=true).\n');
    process.exit(1);
  }
} else {
  console.log(`[validate-content] OK (${mode}): ${files.length} Apartments, alle Pflichtfelder vorhanden.`);
}
