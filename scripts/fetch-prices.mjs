// =========================================================================
// Holt die niedrigsten "ab"-Nachtpreise je Apartment aus der Smoobu-API und
// schreibt sie nach src/data/prices.json (wird in den Build gebacken).
// Aktiv nur, wenn SMOOBU_API_KEY gesetzt ist (lokal export / CI-Secret).
// Nutzung: `node scripts/fetch-prices.mjs`
// =========================================================================
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import path from 'node:path';

const KEY = process.env.SMOOBU_API_KEY;
const SECRET = process.env.SMOOBU_API_SECRET;
const OUT = 'src/data/prices.json';
const DIR = 'src/content/apartments';

if (!KEY) {
  console.log('SMOOBU_API_KEY nicht gesetzt – Preis-Abruf übersprungen; der vorhandene, datierte Fallback bleibt erhalten.');
  process.exit(0);
}

if (!SECRET) {
  console.warn('SMOOBU_API_SECRET fehlt – verwende vorübergehend Legacy-Authentifizierung (Smoobu-Abschaltung: 25.09.2026).');
}

const EMPTY_SHA256 = createHash('sha256').update('').digest('hex');

/** HMAC ist Smoobus empfohlene Authentifizierung; ohne Secret bleibt bis zur
 * Abschaltung der Legacy-Header als Übergang aktiv. */
function authHeaders(url) {
  if (!SECRET) return { 'Api-Key': KEY, 'Cache-Control': 'no-cache' };

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const nonce = randomUUID();
  const canonical = [
    'GET',
    url.pathname,
    url.search.slice(1),
    timestamp,
    nonce,
    EMPTY_SHA256,
    KEY,
  ].join('\n');
  const signature = createHmac('sha256', SECRET).update(canonical).digest('base64');

  return {
    'X-API-Key': KEY,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
    'Cache-Control': 'no-cache',
  };
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
const failures = [];
for (const id of ids) {
  // Query alphabetisch sortieren; exakt diese Zeichenfolge wird bei HMAC
  // signiert und anschließend unverändert angefragt.
  const params = new URLSearchParams({ 'apartments[]': id, end_date: fmt(end), start_date: fmt(start) });
  params.sort();
  const url = new URL(`https://login.smoobu.com/api/rates?${params}`);
  try {
    const res = await fetch(url, { headers: authHeaders(url), signal: AbortSignal.timeout(15_000) });
    if (!res.ok) { failures.push(`Apartment ${id}: HTTP ${res.status}`); continue; }
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
    else failures.push(`Apartment ${id}: kein gültiger verfügbarer Preis`);
  } catch (e) {
    failures.push(`Apartment ${id}: ${e.message}`);
  }
}

if (failures.length || Object.keys(prices).length !== ids.length) {
  failures.forEach((failure) => console.error(failure));
  console.error('Preis-Abruf unvollständig – vorhandenen Snapshot nicht überschrieben.');
  process.exit(1);
}

const snapshot = { updatedAt: new Date().toISOString(), prices };
await writeFile(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Preise für ${ids.length} Apartments aktualisiert (${snapshot.updatedAt}).`);
