import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const base = (process.env.BASE || '/').replace(/\/$/, '');
const staging = process.env.PUBLIC_STAGING === 'true';
const failures = [];
const titles = new Map();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveLocal(raw, htmlFile) {
  const value = raw.split('#')[0].split('?')[0];
  // Jede URL mit Schema ist kein lokales Ziel (http/mailto/tel, aber auch
  // Custom-App-Schemes wie hausaquamarin:// der Gäste-App-Brücke).
  if (!value || /^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  let pathname = value;
  if (pathname.startsWith('/')) {
    if (base && pathname.startsWith(`${base}/`)) pathname = pathname.slice(base.length);
    else if (base && pathname === base) pathname = '/';
    return path.join(root, decodeURIComponent(pathname));
  }
  return path.resolve(path.dirname(htmlFile), decodeURIComponent(pathname));
}

function existingTarget(target, raw) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (raw.split(/[?#]/)[0].endsWith('/') && fs.existsSync(path.join(target, 'index.html'))) return true;
  if (!path.extname(target) && fs.existsSync(path.join(target, 'index.html'))) return true;
  return false;
}

if (!fs.existsSync(root)) failures.push('dist/ fehlt – zuerst npm run build ausführen.');
else {
  const files = walk(root);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  if (htmlFiles.length < 70) failures.push(`Zu wenige HTML-Seiten: ${htmlFiles.length} (erwartet mindestens 70).`);

  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, 'utf8');
    const lang = html.match(/<html lang="([^"]+)"/)?.[1] ?? 'unknown';
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
    if (!title) failures.push(`${rel}: title fehlt.`);
    else {
      const titleKey = `${lang}:${title}`;
      const previous = titles.get(titleKey);
      if (previous && rel !== '404.html') failures.push(`${rel}: doppelter title wie ${previous}: ${title}`);
      else titles.set(titleKey, rel);
    }
    if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push(`${rel}: Meta-Description fehlt.`);
    if (!/<link rel="canonical" href="https?:\/\/[^" ]+"/.test(html)) failures.push(`${rel}: Canonical fehlt.`);
    if (!/<html lang="[^"]+"/.test(html)) failures.push(`${rel}: html[lang] fehlt.`);
    if (!/<h1(?:\s|>)/.test(html)) failures.push(`${rel}: H1 fehlt.`);
    // HTML erlaubt bei dekorativen Bildern sowohl alt="" als auch das von Astro
    // minimierte boolesche `alt`; beides beschreibt korrekt einen leeren Alt-Text.
    if (/<img(?![^>]*\salt(?:\s|=|>))[^>]*>/i.test(html)) failures.push(`${rel}: Bild ohne alt-Attribut.`);
    if (staging && !/<meta name="robots" content="noindex, nofollow"/.test(html)) failures.push(`${rel}: Staging-noindex fehlt.`);

    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    const refs = [];
    for (const match of markup.matchAll(/(?:href|src)="([^"]+)"/g)) refs.push(match[1]);
    for (const match of markup.matchAll(/srcset="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) refs.push(candidate.trim().split(/\s+/)[0]);
    }
    for (const ref of new Set(refs)) {
      const target = resolveLocal(ref, file);
      if (target && !existingTarget(target, ref)) failures.push(`${rel}: fehlendes lokales Ziel ${ref}`);
    }
  }

  for (const required of ['_redirects', '_headers', 'site.webmanifest', 'robots.txt', 'sitemap-index.xml']) {
    if (!fs.existsSync(path.join(root, required))) failures.push(`Build-Artefakt fehlt: ${required}`);
  }
  try { JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8')); }
  catch { failures.push('site.webmanifest ist kein gültiges JSON.'); }
}

if (failures.length) {
  console.error(`Launch-Audit fehlgeschlagen (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Launch-Audit bestanden: ${titles.size} eindeutige Seitentitel, alle lokalen Links und Assets vorhanden.`);
