// =========================================================================
// i18n — Hilfsfunktionen: Sprache aus URL, Übersetzung, lokalisierte Pfade,
// hreflang-Alternates. Base-aware (funktioniert am Domain-Root UND unter
// einem Unterpfad wie GitHub Pages /<repo>/).
// =========================================================================
import { ui, defaultLang, languages, type Lang, type UIKey } from './ui';

export const locales = Object.keys(languages) as Lang[];

/** Astro-Base-Pfad ohne Trailing-Slash ('' am Root, '/repo' unter Unterpfad). */
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

/** Entfernt den Base-Präfix vom Pfad, damit das erste Segment die Sprache ist. */
function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
  return pathname;
}

/** Prefixt einen Root-relativen Pfad mit dem Base-Pfad (für Assets/Links). */
export function withBase(path: string): string {
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}

/** Ermittelt die aktive Sprache aus dem URL-Pfad (DE = Root, sonst /xx/...). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = stripBase(url.pathname).split('/');
  if (seg in languages && seg !== defaultLang) return seg as Lang;
  return defaultLang;
}

/** Liefert die Übersetzungsfunktion t() für eine Sprache (Fallback DE). */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Base-aware lokalisierter Pfad. DE ohne Sprach-Präfix, andere mit /xx.
 * localizedPath('apartments', 'en') -> '/en/apartments' (bzw. '/repo/en/apartments').
 */
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const langPrefix = lang === defaultLang ? '' : `/${lang}`;
  // Trailing-Slash, damit Links zu Astros Verzeichnis-Ausgabe + Canonical passen.
  const rel = clean ? `${langPrefix}/${clean}/` : `${langPrefix}/`;
  return `${BASE}${rel}` || '/';
}

/** Sprachneutralen Slug aus aktuellem Pfad ableiten (Base + Locale entfernen). */
export function pageKeyFromUrl(url: URL): string {
  const segments = stripBase(url.pathname).split('/').filter(Boolean);
  if (segments[0] && (locales as string[]).includes(segments[0]) && segments[0] !== defaultLang) {
    segments.shift();
  }
  return segments.join('/');
}

/**
 * hreflang-Alternates für eine logische Seite über alle Sprachen + x-default.
 * pageKey ist der sprachneutrale Slug, z. B. '' (Start) oder 'apartments'.
 */
export function alternateLinks(pageKey: string, origin: string | URL) {
  const base = (typeof origin === 'string' ? origin : origin.href).replace(/\/+$/, '');
  const links = locales.map((lang) => ({
    lang,
    hreflang: hreflangCode(lang),
    href: `${base}${localizedPath(pageKey, lang)}`,
  }));
  links.push({ lang: defaultLang, hreflang: 'x-default', href: `${base}${localizedPath(pageKey, defaultLang)}` });
  return links;
}

export function hreflangCode(lang: Lang): string {
  return { de: 'de-DE', en: 'en', nl: 'nl', da: 'da' }[lang];
}

export { defaultLang, languages, type Lang };
