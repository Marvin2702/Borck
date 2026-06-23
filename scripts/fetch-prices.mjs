// =========================================================================
// Holt die niedrigsten "ab"-Nachtpreise je Apartment aus der Smoobu-API und
// schreibt sie nach src/data/prices.json (wird in den Build gebacken).
// Aktiv nur, wenn SMOOBU_API_KEY gesetzt ist (lokal export / CI-Secret).
// Nutzung: `node scripts/fetch-prices.mjs`
// =========================================================================
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.SMOOBU_API_KEY;
const OUT = 'src/data/prices.json';
const DIR = 'src/content/apartments';

if (!KEY) {
  console.log('SMOOBU_API_KEY nicht gesetzt – Preis-Abruf übersprungen (Karten zeigen „Preis je nach Zeitraum").');
  process.exit(0);
}

// Apartment-IDs aus den Markdown-Frontmattern lesen (bleibt automatisch in Sync).
const ids = [];
for (const f of await readdir(DIR)) {
  if (!f.endsWith('.md')) continue;
  const m = (await readFile(path.join(DIR, f), 'utf8')).match(/smoobu_id:\s*"?(\d+)"?/);
  if (m) ids.push(m[1]);
}

const fmt = (d) => d.toISOString().slice(0, 10);
const start = new Date();
const end = new Date();
end.setDate(end.getDate() + 365);

const prices = {};
for (const id of ids) {
  const url = `https://login.smoobu.com/api/rates?apartments[]=${id}&start_date=${fmt(start)}&end_date=${fmt(end)}`;
  try {
    const res = await fetch(url, { headers: { 'Api-Key': KEY, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
    if (!res.ok) { console.warn(`Apartment ${id}: HTTP ${res.status}`); continue; }
    const json = await res.json();
    const days = (json && json.data && json.data[id]) || {};
    let min = Infinity;
    for (const date in days) {
      const day = days[date] || {};
      const price = Number(day.price);
      const available = day.available;
      if (price > 0 && (available === undefined || available === 1)) min = Math.min(min, price);
    }
    if (min !== Infinity) prices[id] = Math.round(min);
  } catch (e) {
    console.warn(`Apartment ${id}: ${e.message}`);
  }
}

await writeFile(OUT, JSON.stringify(prices, null, 2) + '\n');
console.log('Preise aktualisiert:', prices);
