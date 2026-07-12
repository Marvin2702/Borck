import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(root, 'dist', 'gast-app');
const contentFile = path.join(root, 'app', 'assets', 'content.json');
const failures = [];

function normalizeBase(value = '') {
  const trimmed = value.trim();
  if (/[?#]/.test(trimmed)) throw new Error(`BASE darf weder Query noch Fragment enthalten: ${trimmed}`);
  const pathname = trimmed.replace(/^\/+|\/+$/g, '');
  return pathname ? `/${pathname}` : '';
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
}

function hasNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
    const tag = match[0];
    return attribute(tag, 'name')?.toLowerCase() === 'robots'
      && attribute(tag, 'content')?.toLowerCase().split(/[\s,]+/).includes('noindex');
  });
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => attribute(match[0], 'href'))
    .filter(Boolean);
}

function routeArtifact(...segments) {
  return fs.existsSync(path.join(appRoot, ...segments, 'index.html'));
}

function existingTarget(target, pathname) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(`${target}.html`)) return true;
  return fs.existsSync(path.join(target, 'index.html')) || pathname.endsWith('/') && fs.existsSync(path.join(target, 'index.html'));
}

function localTarget(raw, htmlFile, appWebBase) {
  if (!raw || raw.startsWith('#') || /^(?:data:|mailto:|tel:|https?:|[a-z][a-z0-9+.-]*:)/i.test(raw)) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(raw.split(/[?#]/)[0]);
  } catch {
    failures.push(`${path.relative(appRoot, htmlFile)}: ungültig codierte lokale URL ${raw}`);
    return null;
  }

  if (pathname.startsWith('/')) {
    if (pathname !== appWebBase && !pathname.startsWith(`${appWebBase}/`)) {
      failures.push(`${path.relative(appRoot, htmlFile)}: absolute URL liegt außerhalb von ${appWebBase}/: ${raw}`);
      return null;
    }
    pathname = pathname.slice(appWebBase.length).replace(/^\/+/, '');
    return { target: path.resolve(appRoot, pathname), pathname };
  }

  return { target: path.resolve(path.dirname(htmlFile), pathname), pathname };
}

const appWebBase = `${normalizeBase(process.env.BASE)}/gast-app`;

if (!fs.existsSync(appRoot)) {
  failures.push('dist/gast-app/ fehlt – zuerst npm run build:with-app ausführen.');
} else if (!fs.existsSync(contentFile)) {
  failures.push('app/assets/content.json fehlt.');
} else {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  } catch (error) {
    failures.push(`app/assets/content.json ist ungültig: ${error.message}`);
  }

  const files = walk(appRoot);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  if (!fs.existsSync(path.join(appRoot, 'index.html'))) failures.push('dist/gast-app/index.html fehlt.');
  if (!files.some((file) => path.relative(appRoot, file).startsWith(`_expo${path.sep}`))) {
    failures.push('dist/gast-app/_expo/ mit den gebündelten App-Artefakten fehlt.');
  }
  if (!htmlFiles.length) failures.push('Expo-Export enthält keine HTML-Dateien.');

  for (const file of htmlFiles) {
    const rel = path.relative(appRoot, file);
    const html = fs.readFileSync(file, 'utf8');
    if (!hasNoindex(html)) failures.push(`${rel}: robots noindex fehlt.`);

    // Nur echte HTML-Tags prüfen, damit Strings in Inline-JavaScript nicht als
    // vermeintliche Assets zählen. Script-Tags bleiben dabei ausdrücklich
    // enthalten: ein fehlendes Expo-JS-Bundle darf nicht als grüner Build
    // durchgehen, selbst wenn irgendeine andere Datei unter _expo/ existiert.
    const tags = [...html.matchAll(/<(?:a|img|link|script|source)\b[^>]*>/gi)].map((match) => match[0]);
    const refs = tags.flatMap((tag) => [attribute(tag, 'href'), attribute(tag, 'src')]).filter(Boolean);
    const scripts = tags
      .filter((tag) => /^<script\b/i.test(tag))
      .map((tag) => attribute(tag, 'src'))
      .filter(Boolean);
    if (!scripts.some((src) => src.startsWith(`${appWebBase}/_expo/`) && /\.js(?:[?#]|$)/i.test(src))) {
      failures.push(`${rel}: lokales Expo-JS-Bundle fehlt.`);
    }
    for (const ref of new Set(refs)) {
      const local = localTarget(ref, file, appWebBase);
      if (!local) continue;
      const relativeTarget = path.relative(appRoot, local.target);
      if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
        failures.push(`${rel}: lokale URL verlässt den App-Build: ${ref}`);
      } else if (!existingTarget(local.target, local.pathname)) {
        failures.push(`${rel}: lokales Ziel fehlt: ${ref}`);
      }
    }
  }

  for (const [kind, route, entries] of [
    ['Wohnung', 'wohnung', content?.apartments],
    ['Guide', 'heute', content?.guides],
  ]) {
    if (!Array.isArray(entries) || !entries.length) {
      failures.push(`${kind}-Inhalte fehlen in app/assets/content.json.`);
      continue;
    }
    for (const entry of entries) {
      if (!entry?.slug || !/^[a-z0-9-]+$/.test(entry.slug)) {
        failures.push(`${kind} besitzt keinen sicheren statischen Slug: ${JSON.stringify(entry?.slug)}`);
        continue;
      }
      if (!routeArtifact(route, entry.slug)) failures.push(`${kind}-Route fehlt: ${route}/${entry.slug}`);
    }
  }

  if (Array.isArray(content?.apartments)) {
    for (const apartment of content.apartments) {
      if (!apartment?.slug || !/^[a-z0-9-]+$/.test(apartment.slug)) continue;
      const bridgeFile = path.join(root, 'dist', 'gast', apartment.slug, 'index.html');
      if (!fs.existsSync(bridgeFile)) {
        failures.push(`Gäste-Brücke fehlt: gast/${apartment.slug}/index.html`);
        continue;
      }

      const bridgeHrefs = hrefs(fs.readFileSync(bridgeFile, 'utf8'));
      for (const expected of [
        `hausaquamarin://wohnung/${apartment.slug}`,
        `${appWebBase}/`,
      ]) {
        const count = bridgeHrefs.filter((href) => href === expected).length;
        if (count !== 1) {
          failures.push(`gast/${apartment.slug}/index.html: Link ${expected} genau einmal erwartet, gefunden: ${count}.`);
        }
      }
    }
  }

  if (!failures.length) {
    console.log(
      `Gäste-App-Audit bestanden: ${htmlFiles.length} HTML-Artefakte mit noindex, `
      + `${content.apartments.length} Wohnungs- und ${content.guides.length} Guide-Routen sowie `
      + `${content.apartments.length} geprüfte Gäste-Brücken (Base ${appWebBase}).`,
    );
  }
}

if (failures.length) {
  const unique = [...new Set(failures)];
  console.error(`Gäste-App-Audit fehlgeschlagen (${unique.length}):`);
  unique.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
