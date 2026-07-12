import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.env.BUILD_DIR || 'dist');
const productionSite = new URL(process.env.PRODUCTION_SITE || 'https://www.nordsee-buesum-fewo.de');
const configuredSite = new URL(process.env.SITE || productionSite.href);
const base = normalizeBase(process.env.BASE || '/');
const staging = process.env.PUBLIC_STAGING === 'true';
const cloudflareBranch = (process.env.CF_PAGES_BRANCH || '').trim();
const requiresIndexable = process.env.REQUIRE_INDEXABLE === 'true' || cloudflareBranch === 'main';
const configuredGa4Id = (process.env.PUBLIC_GA4_ID || '').trim();
const configuredFormKey = (process.env.PUBLIC_WEB3FORMS_ACCESS_KEY || '').trim();
const maxInitialJsBytes = numberFromEnv('MAX_INITIAL_JS_BYTES', 100 * 1024);
const maxImageBytes = numberFromEnv('MAX_IMAGE_BYTES', 600 * 1024);
const failures = [];
const warnings = [];
const titles = new Map();
let largestInitialJs = { bytes: 0, file: '' };
let largestImage = { bytes: 0, file: '' };

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} muss eine positive Zahl sein.`);
  return value;
}

function normalizeBase(value) {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function decodeHtml(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
}

function resolveLocal(raw, htmlFile) {
  const value = decodeHtml(raw).split('#')[0].split('?')[0];
  // Jede URL mit Schema ist kein lokales Ziel (http/mailto/tel, aber auch
  // Custom-App-Schemes wie hausaquamarin:// der Gäste-App-Brücke).
  if (!value || /^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  // /gast-app/ (Web-Vorschau der Gäste-App) wird im Deploy NACH dem Audit
  // in dist/ kopiert — als Ziel akzeptieren, nicht als Datei prüfen.
  if (value.startsWith(`${base}/gast-app/`) || value === `${base}/gast-app`) return null;
  let pathname = value;
  if (pathname.startsWith('/')) {
    if (base && pathname.startsWith(`${base}/`)) pathname = pathname.slice(base.length);
    else if (base && pathname === base) pathname = '/';
    return path.resolve(root, `.${decodeURIComponent(pathname)}`);
  }
  return path.resolve(path.dirname(htmlFile), decodeURIComponent(pathname));
}

function existingTarget(target, raw) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  const pathname = decodeHtml(raw).split(/[?#]/)[0];
  if (pathname.endsWith('/') && fs.existsSync(path.join(target, 'index.html'))) return true;
  if (!path.extname(target) && fs.existsSync(path.join(target, 'index.html'))) return true;
  return false;
}

function routeFor(rel) {
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel.replace(/\.html$/, '/')}`;
}

function isIntentionalNoindex(rel) {
  return rel === '404.html'
    || /^(?:(?:en|nl|da)\/)?danke\/index\.html$/.test(rel)
    || /^gast\/[^/]+\/index\.html$/.test(rel)
    || /^gast-app(?:\/|$)/.test(rel);
}

function isForbiddenSitemapPath(pathname) {
  return pathname.endsWith('/danke/') || /(?:^|\/)gast(?:-app)?(?:\/|$)/.test(pathname);
}

function expectedRuntimeUrl(route) {
  return new URL(`${base}${route}` || '/', configuredSite.origin).href;
}

function expectedCanonicalUrl(route) {
  return new URL(route, productionSite.origin).href;
}

function runtimeUrlUsesExpectedHost(raw) {
  try {
    const url = new URL(decodeHtml(raw));
    if (url.origin !== configuredSite.origin) return false;
    return !base || url.pathname === base || url.pathname.startsWith(`${base}/`);
  } catch {
    return false;
  }
}

function seoUrlUsesProductionHost(raw) {
  try {
    const url = new URL(decodeHtml(raw));
    return url.origin === productionSite.origin && !url.pathname.startsWith(`${base || '/__no_base__'}/`);
  } catch {
    return false;
  }
}

function parseJsonLd(html, rel) {
  const objects = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (error) {
      failures.push(`${rel}: ungültiges JSON-LD (${error.message}).`);
    }
  }
  for (const object of objects) {
    if (!object || typeof object !== 'object' || !object['@type']) failures.push(`${rel}: JSON-LD ohne @type.`);
  }
  return objects;
}

function schemaTypes(objects) {
  const result = new Set();
  for (const object of objects) {
    const values = Array.isArray(object?.['@type']) ? object['@type'] : [object?.['@type']];
    for (const value of values) if (typeof value === 'string') result.add(value);
  }
  return result;
}

function executableJsBytes(html, htmlFile) {
  let bytes = 0;
  const localScripts = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    if (/type=["']application\/ld\+json["']/i.test(attrs)) continue;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (src) localScripts.add(src);
    else bytes += Buffer.byteLength(match[2]);
  }
  for (const match of html.matchAll(/<link\b[^>]*rel=["']modulepreload["'][^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    localScripts.add(match[1]);
  }
  for (const src of localScripts) {
    const target = resolveLocal(src, htmlFile);
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) bytes += fs.statSync(target).size;
  }
  return bytes;
}

function auditRedirects() {
  const file = path.join(root, '_redirects');
  if (!fs.existsSync(file)) return;
  const sources = new Map();
  const rules = [];
  for (const [index, rawLine] of fs.readFileSync(file, 'utf8').split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length !== 3) {
      failures.push(`_redirects:${index + 1}: erwartet werden Quelle, Ziel und Status.`);
      continue;
    }
    const [source, destination, status] = parts;
    if (!source.startsWith('/')) failures.push(`_redirects:${index + 1}: Quelle muss mit / beginnen.`);
    if (status !== '301') failures.push(`_redirects:${index + 1}: permanenter Redirect muss Status 301 haben.`);
    if (sources.has(source)) failures.push(`_redirects:${index + 1}: doppelte Quelle ${source}.`);
    else sources.set(source, index + 1);
    rules.push({ source, destination, line: index + 1 });
  }
  for (const rule of rules) {
    if (/^https?:/i.test(rule.destination)) continue;
    const destinationPath = decodeURIComponent(rule.destination.split(/[?#]/)[0]);
    const target = path.resolve(root, `.${destinationPath}`);
    if (!existingTarget(target, destinationPath)) failures.push(`_redirects:${rule.line}: Ziel fehlt im Build: ${rule.destination}`);
    if (sources.has(destinationPath)) failures.push(`_redirects:${rule.line}: Redirectkette über ${destinationPath}.`);
  }
  return rules.length;
}

function auditSitemaps() {
  const files = fs.readdirSync(root).filter((file) => /^sitemap.*\.xml$/.test(file));
  for (const file of files) {
    const xml = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (!runtimeUrlUsesExpectedHost(match[1])) failures.push(`${file}: unerwartete Sitemap-URL ${match[1]}`);
      try {
        const pathname = new URL(decodeHtml(match[1])).pathname;
        if (isForbiddenSitemapPath(pathname)) failures.push(`${file}: noindex-Seite darf nicht in der Sitemap stehen: ${pathname}`);
      } catch { /* Der Host-/URL-Check oben meldet ungültige Werte. */ }
    }
  }
}

function auditPriceFreshness() {
  const file = path.resolve('src/data/prices.json');
  if (!fs.existsSync(file)) {
    warnings.push('src/data/prices.json fehlt; es werden keine API-Preise angezeigt.');
    return;
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.updatedAt || !data.prices || typeof data.prices !== 'object') {
      warnings.push('prices.json verwendet noch kein { updatedAt, prices }-Format.');
      return;
    }
    const timestamp = Date.parse(data.updatedAt);
    if (!Number.isFinite(timestamp)) {
      warnings.push(`prices.json enthält ungültiges updatedAt: ${data.updatedAt}`);
      return;
    }
    const ageDays = (Date.now() - timestamp) / 86_400_000;
    if (ageDays > 7) {
      const message = `Smoobu-Preise sind ${ageDays.toFixed(1)} Tage alt; die Website blendet Werte ab 7 Tagen aus.`;
      if (process.env.REQUIRE_FRESH_PRICES === 'true') failures.push(message);
      else warnings.push(message);
    }
  } catch (error) {
    failures.push(`prices.json ist ungültig: ${error.message}`);
  }
}

if (!fs.existsSync(root)) {
  failures.push('dist/ fehlt – zuerst npm run build ausführen.');
} else {
  if (requiresIndexable && staging) {
    failures.push('Als indexierbar markierter Produktionsdeploy darf niemals PUBLIC_STAGING=true verwenden.');
  }
  if (cloudflareBranch && cloudflareBranch !== 'main' && !staging) {
    failures.push(`Cloudflare-Preview-Branch ${cloudflareBranch} muss PUBLIC_STAGING=true verwenden.`);
  }
  if (!staging) {
    if (configuredSite.origin !== productionSite.origin || base) {
      failures.push(`Indexierbarer Build muss ${productionSite.origin}/ am Root verwenden (SITE=${configuredSite.origin}, BASE=${base || '/'}).`);
    }
  }

  const files = walk(root);
  // Der Expo-Export hat einen eigenen Vertrag (noindex, statische Routen,
  // Bundles und Brückenseiten) und wird von audit-guest-app.mjs geprüft.
  // Deshalb darf ein nachträgliches `npm run audit:build` auf einem
  // Kombiartefakt ihn nicht wie Astro-Marketingseiten behandeln.
  const websiteFiles = files.filter((file) => {
    const rel = path.relative(root, file);
    return rel !== 'gast-app' && !rel.startsWith(`gast-app${path.sep}`);
  });
  const htmlFiles = websiteFiles.filter((file) => file.endsWith('.html'));
  if (htmlFiles.length < 70) failures.push(`Zu wenige HTML-Seiten: ${htmlFiles.length} (erwartet mindestens 70).`);

  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, 'utf8');
    const lang = html.match(/<html lang=["']([^"']+)["']/)?.[1] ?? 'unknown';
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
    if (!title) failures.push(`${rel}: title fehlt.`);
    else {
      const titleKey = `${lang}:${title}`;
      const previous = titles.get(titleKey);
      if (previous && rel !== '404.html') failures.push(`${rel}: doppelter title wie ${previous}: ${title}`);
      else titles.set(titleKey, rel);
    }

    if (!/<meta name=["']description["'] content=["'][^"']+/i.test(html)) failures.push(`${rel}: Meta-Description fehlt.`);
    if (!/<html lang=["'][^"']+/i.test(html)) failures.push(`${rel}: html[lang] fehlt.`);
    if (!/<h1(?:\s|>)/i.test(html)) failures.push(`${rel}: H1 fehlt.`);
    if (/<img(?![^>]*\salt(?:\s|=|>))[^>]*>/i.test(html)) failures.push(`${rel}: Bild ohne alt-Attribut.`);

    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    const wantedCanonical = expectedCanonicalUrl(routeFor(rel));
    if (!canonical) failures.push(`${rel}: Canonical fehlt.`);
    else if (decodeHtml(canonical) !== wantedCanonical) failures.push(`${rel}: Canonical ${canonical} statt ${wantedCanonical}.`);

    const ogUrl = html.match(/<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1];
    if (!ogUrl || decodeHtml(ogUrl) !== wantedCanonical) failures.push(`${rel}: og:url stimmt nicht mit Canonical überein.`);

    for (const match of html.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*href=["']([^"']+)["'][^>]*>/gi)) {
      if (!seoUrlUsesProductionHost(match[1])) failures.push(`${rel}: hreflang zeigt nicht kanonisch auf die Produktionsdomain: ${match[1]}`);
    }

    const robots = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
    if (staging && !robots.includes('noindex')) failures.push(`${rel}: Staging-noindex fehlt.`);
    if (!staging && !isIntentionalNoindex(rel) && robots.includes('noindex')) failures.push(`${rel}: Produktionsseite enthält noindex.`);
    if (!staging && isIntentionalNoindex(rel) && !robots.includes('noindex')) failures.push(`${rel}: beabsichtigtes noindex fehlt.`);
    if (configuredGa4Id) {
      if (!/^G-[A-Z0-9]+$/i.test(configuredGa4Id)) failures.push('PUBLIC_GA4_ID hat kein gültiges G-…-Format.');
      for (const marker of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization', '__haConsentDefaultSet']) {
        if (!html.includes(marker)) failures.push(`${rel}: Consent-Mode-Marker ${marker} fehlt trotz PUBLIC_GA4_ID.`);
      }
    }
    if (/^(?:(?:en|nl|da)\/)?kontakt\/index\.html$/.test(rel) && configuredFormKey) {
      if (!html.includes('data-haskey="1"') || !html.includes('api.web3forms.com/submit')) {
        failures.push(`${rel}: konfigurierter Web3Forms-Pfad fehlt.`);
      }
    }
    if (/^(?:(?:en|nl|da)\/)?danke\/index\.html$/.test(rel) && !html.includes('generate_lead')) {
      failures.push(`${rel}: generate_lead-Bestätigungslogik fehlt.`);
    }

    const jsonLd = parseJsonLd(html, rel);
    const types = schemaTypes(jsonLd);
    if (rel !== '404.html' && !types.has('LodgingBusiness')) failures.push(`${rel}: LodgingBusiness-Schema fehlt.`);
    if (/^(?:(?:en|nl|da)\/)?apartments\/[^/]+\/index\.html$/.test(rel)) {
      for (const required of ['Apartment', 'BreadcrumbList']) if (!types.has(required)) failures.push(`${rel}: ${required}-Schema fehlt.`);
    }
    if (/^reisefuehrer\/[^/]+\/index\.html$/.test(rel)) {
      for (const required of ['Article', 'BreadcrumbList']) if (!types.has(required)) failures.push(`${rel}: ${required}-Schema fehlt.`);
    }

    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    const refs = [];
    for (const match of markup.matchAll(/(?:href|src)=["']([^"']+)["']/g)) refs.push(match[1]);
    for (const match of markup.matchAll(/srcset=["']([^"']+)["']/g)) {
      for (const candidate of match[1].split(',')) refs.push(candidate.trim().split(/\s+/)[0]);
    }
    for (const ref of new Set(refs)) {
      const target = resolveLocal(ref, file);
      if (target && !existingTarget(target, ref)) failures.push(`${rel}: fehlendes lokales Ziel ${ref}`);
    }

    const jsBytes = executableJsBytes(html, file);
    if (jsBytes > largestInitialJs.bytes) largestInitialJs = { bytes: jsBytes, file: rel };
    if (jsBytes > maxInitialJsBytes) failures.push(`${rel}: initiales eigenes JavaScript ${jsBytes} B > Budget ${maxInitialJsBytes} B.`);
  }

  for (const file of websiteFiles.filter((entry) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(entry))) {
    const bytes = fs.statSync(file).size;
    if (bytes > largestImage.bytes) largestImage = { bytes, file: path.relative(root, file) };
    if (bytes > maxImageBytes) failures.push(`${path.relative(root, file)}: Bild ${bytes} B > Budget ${maxImageBytes} B.`);
  }

  for (const required of ['_redirects', '_headers', 'site.webmanifest', 'robots.txt', 'sitemap-index.xml']) {
    if (!fs.existsSync(path.join(root, required))) failures.push(`Build-Artefakt fehlt: ${required}`);
  }
  try {
    JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8'));
  } catch {
    failures.push('site.webmanifest ist kein gültiges JSON.');
  }

  const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
  for (const required of ['Content-Security-Policy:', 'Strict-Transport-Security:', 'X-Content-Type-Options:']) {
    if (!headers.includes(required)) failures.push(`_headers: ${required.slice(0, -1)} fehlt.`);
  }
  for (const route of ['/gast/*', '/gast-app/*']) {
    const block = headers.match(new RegExp(`^${route.replaceAll('*', '\\*')}\\n((?:[ \\t]+[^\\n]+\\n?)*)`, 'm'))?.[1] || '';
    if (!/^\s+X-Robots-Tag:\s*noindex,\s*nofollow\s*$/im.test(block)) {
      failures.push(`_headers: X-Robots-Tag für ${route} fehlt.`);
    }
  }

  const robotsText = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const wantedSitemap = expectedRuntimeUrl('/sitemap-index.xml');
  if (!robotsText.includes(`Sitemap: ${wantedSitemap}`)) failures.push(`robots.txt: erwartete Sitemap ${wantedSitemap} fehlt.`);
  if (/^Disallow:\s*\/$/im.test(robotsText)) failures.push('robots.txt blockiert die gesamte Website.');
  for (const route of [`${base}/gast/`, `${base}/gast-app/`]) {
    const occurrences = robotsText.match(new RegExp(`^Disallow: ${route.replaceAll('/', '\\/')}\\s*$`, 'gm'))?.length || 0;
    if (occurrences < 2) failures.push(`robots.txt: ${route} muss für allgemeine und spezifische AI-Bots gesperrt sein.`);
  }

  auditSitemaps();
  const redirectCount = auditRedirects() || 0;
  auditPriceFreshness();

  if (!failures.length) {
    warnings.forEach((warning) => console.warn(`Audit-Warnung: ${warning}`));
    console.log(
      `Launch-Audit bestanden: ${titles.size} eindeutige Seitentitel, ${redirectCount} geprüfte 301-Redirects, ` +
      `max. initiales JS ${largestInitialJs.bytes} B (${largestInitialJs.file}), größtes Bild ${largestImage.bytes} B (${largestImage.file}).`,
    );
  }
}

if (failures.length) {
  const unique = [...new Set(failures)];
  console.error(`Launch-Audit fehlgeschlagen (${unique.length}):`);
  unique.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
