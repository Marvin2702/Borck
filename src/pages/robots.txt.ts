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
  const llms = new URL(`${BASE}/llms.txt`, origin).href;
  // AI-Crawler ausdrücklich erlaubt (Sichtbarkeit in ChatGPT/Perplexity/Gemini);
  // `User-agent: *` erlaubt sie ohnehin — explizit dokumentiert die Absicht.
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'];
  // /gast/ (QR-Brücke) und /gast-app/ (Web-Vorschau der Gäste-App) sind
  // Gäste-Bereiche — Crawler dürfen draußen bleiben. Eigene User-Agent-
  // Gruppen erben die Sternchen-Regeln nicht, daher stehen dieselben
  // Disallows auch ausdrücklich in der gemeinsamen AI-Bot-Gruppe.
  const crawlRules = `Allow: /\nDisallow: ${BASE}/gast/\nDisallow: ${BASE}/gast-app/`;
  const aiSection = `${aiBots.map((bot) => `User-agent: ${bot}`).join('\n')}\n${crawlRules}`;
  const body = `User-agent: *\n${crawlRules}\n\n${aiSection}\n\nSitemap: ${sitemap}\n# AI-Kurzprofil: ${llms}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
