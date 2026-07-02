// =========================================================================
// robots.txt dynamisch erzeugt: Die Sitemap-URL folgt SITE/BASE aus der
// Astro-Config (Staging vs. Prod) statt einer hardcodierten Domain.
// Hinweis: Auf GitHub-Pages-Projektpfaden (/Borck/) ist robots.txt ohnehin
// wirkungslos (zählt nur am Host-Root); auf der Prod-Domain ist sie korrekt.
// =========================================================================
import type { APIRoute } from 'astro';
import { site } from '../data/site';

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export const GET: APIRoute = ({ site: astroSite }) => {
  const origin = astroSite ?? new URL(site.domain);
  const sitemap = new URL(`${BASE}/sitemap-index.xml`, origin).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
