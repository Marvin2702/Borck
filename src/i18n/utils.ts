// =========================================================================
// i18n — Hilfsfunktionen: Sprache aus URL, Übersetzung, lokalisierte Pfade,
// hreflang-Alternates. Zentral, damit Komponenten sprach-agnostisch bleiben.
// =========================================================================
import { ui, defaultLang, languages, type Lang, type UIKey } from './ui';

export const locales = Object.keys(languages) as Lang[];

/** Ermittelt die aktive Sprache aus dem URL-Pfad (DE = Root, sonst /xx/...). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
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
 * Baut einen lokalisierten Pfad. DE ohne Präfix, andere mit /xx.
 * localizedPath('apartments', 'en') -> '/en/apartments'
 */
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return clean ? `${prefix}/${clean}` : `${prefix}/`;
}

/**
 * hreflang-Alternates für eine logische Seite über alle Sprachen + x-default.
 * pageKey ist der sprachneutrale Slug, z. B. '' (Start) oder 'apartments'.
 */
export function alternateLinks(pageKey: string, site: string | URL) {
  const base = (typeof site === 'string' ? site : site.href).replace(/\/+$/, '');
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
