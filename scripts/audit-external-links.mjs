import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.env.BUILD_DIR || 'dist');
const siteOrigin = new URL(process.env.SITE || 'https://www.nordsee-buesum-fewo.de').origin;
const concurrency = positiveNumber('LINK_CHECK_CONCURRENCY', 6);
const timeoutMs = positiveNumber('LINK_CHECK_TIMEOUT_MS', 15_000);
const retries = positiveNumber('LINK_CHECK_RETRIES', 3);
const acceptedRestrictedStatuses = new Set([401, 403, 405, 429]);
const customIgnore = (process.env.LINK_CHECK_IGNORE || '').split(',').filter(Boolean).map((value) => new RegExp(value));

function positiveNumber(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} muss eine positive Zahl sein.`);
  return value;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return nested.flat();
}

function cleanCandidate(value) {
  return value
    .replaceAll('&amp;', '&')
    .replace(/[),.;:`]+$/g, '')
    .trim();
}

function addUrl(urls, candidate) {
  const cleaned = cleanCandidate(candidate);
  try {
    const url = new URL(cleaned);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (url.origin === siteOrigin || url.hostname === 'localhost') return;
    if (customIgnore.some((pattern) => pattern.test(url.href))) return;
    url.hash = '';
    urls.add(url.href);
  } catch {
    // Beispiele und Platzhalter ohne gültigen Host sind keine prüfbaren Links.
  }
}

function extractHtml(html, urls) {
  for (const match of html.matchAll(/\b(?:href|src)=["'](https?:\/\/[^"']+)["']/gi)) addUrl(urls, match[1]);
}

function extractMarkdown(markdown, urls) {
  for (const match of markdown.matchAll(/\]\((https?:\/\/[^\s)]+)(?:\s+[^)]*)?\)/g)) addUrl(urls, match[1]);
  for (const match of markdown.matchAll(/<((?:https?):\/\/[^>]+)>/g)) addUrl(urls, match[1]);
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(url) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
          'Range': 'bytes=0-0',
          'User-Agent': 'Haus-Aquamarin-Link-Audit/1.0 (+https://www.nordsee-buesum-fewo.de)',
        },
      });
      await response.body?.cancel();
      if ((response.status >= 200 && response.status < 400) || acceptedRestrictedStatuses.has(response.status)) {
        return { ok: true, status: response.status, restricted: acceptedRestrictedStatuses.has(response.status) };
      }
      lastError = new Error(`HTTP ${response.status}`);
      if (response.status < 500 && ![408, 425].includes(response.status)) break;
    } catch (error) {
      const cause = error?.cause;
      const detail = [error?.message, cause?.code, cause?.message]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(' – ');
      lastError = new Error(detail || String(error));
    }
    if (attempt < retries) await delay(500 * attempt);
  }
  return { ok: false, error: lastError?.message || 'unbekannter Fehler' };
}

let files;
try {
  files = await walk(root);
} catch {
  console.error('Externer Link-Audit: dist/ fehlt – zuerst npm run build ausführen.');
  process.exit(1);
}

const urls = new Set();
for (const file of files.filter((entry) => entry.endsWith('.html'))) extractHtml(await fs.readFile(file, 'utf8'), urls);
for (const file of ['README.md', 'LAUNCH.md']) {
  try {
    extractMarkdown(await fs.readFile(file, 'utf8'), urls);
  } catch {
    // Optionale Dokumentationsdatei fehlt.
  }
}

const queue = [...urls].sort();
const results = new Array(queue.length);
let cursor = 0;
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  while (cursor < queue.length) {
    const index = cursor;
    cursor += 1;
    results[index] = await request(queue[index]);
  }
}));

const failures = [];
for (const [index, result] of results.entries()) {
  const url = queue[index];
  if (!result.ok) failures.push(`${url} – ${result.error}`);
  else if (result.restricted) console.log(`Erreichbar (HTTP ${result.status}, Bot-/Zugriffsschutz): ${url}`);
}

if (failures.length) {
  console.error(`Externer Link-Audit fehlgeschlagen (${failures.length}/${queue.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Externer Link-Audit bestanden: ${queue.length} eindeutige externe URLs erreichbar.`);
