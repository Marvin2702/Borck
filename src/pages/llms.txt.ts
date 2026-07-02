// =========================================================================
// llms.txt (llmstxt.org): maschinenlesbares Kurzprofil für AI-Suchmaschinen
// (ChatGPT Search, Perplexity, Gemini …). Wird zur Build-Zeit aus denselben
// Quellen erzeugt wie die Seite (site.ts, prices, Apartments/Guides) und ist
// damit automatisch aktuell. URLs folgen SITE/BASE (Staging vs. Prod).
// =========================================================================
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';
import { priceFrom } from '../data/prices';
import { localizedPath } from '../i18n/utils';

export const GET: APIRoute = async ({ site: astroSite }) => {
  const origin = astroSite ?? new URL(site.domain);
  const abs = (path: string) => new URL(localizedPath(path, 'de'), origin).href;

  const apartments = (await getCollection('apartments')).sort((a, b) => a.data.order - b.data.order);
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);

  const aptLines = apartments.map((a) => {
    const d = a.data;
    const price = priceFrom(d.smoobu_id, d.price_from);
    const facts = [
      `${d.persons} Personen`,
      d.size_qm ? `${d.size_qm} m²` : null,
      d.view,
      d.dogFriendly ? 'hundefreundlich' : null,
      price ? `ab ${price} €/Nacht` : null,
    ].filter(Boolean).join(', ');
    return `- [Ferienwohnung ${d.name}](${abs(`apartments/${a.id}`)}): ${facts}`;
  });

  const guideLines = guides.map((g) => `- [${g.data.title}](${abs(`reisefuehrer/${g.id}`)}): ${g.data.teaser}`);

  const body = `# ${site.name} — Ferienwohnungen in Büsum an der Nordsee

> 7 individuell gestaltete Ferienwohnungen direkt am Deich in Büsum (Dithmarschen, Schleswig-Holstein), ca. 400 m von der Familienlagune Perlebucht. Direktbuchung beim Gastgeber ohne Buchungsgebühr. Hundefreundlich, kostenloser PKW-Stellplatz, WLAN und abschließbare Fahrradgarage. Google-Bewertung: ${site.rating.value.toFixed(1).replace('.', ',')}/5 (${site.rating.count} Bewertungen).

Fakten:
- Adresse: ${site.address.street}, ${site.address.postalCode} ${site.address.city}, Deutschland
- Gastgeberin: ${site.legalName} (familiengeführt, persönlicher Kontakt)
- Check-in ab ${site.checkinTime} Uhr (Anreise rund um die Uhr möglich), Check-out bis ${site.checkoutTime} Uhr
- Hunde willkommen: 46 € pro Buchung (2. Hund 23 €)
- Aufenthalte unter 5 Nächten: Kurzreise-Zuschlag 85 €
- Kurtaxe der Gemeinde Büsum wird separat erhoben (2026: 4,00 € Hauptsaison / 2,80 € Nebensaison pro Person und Nacht, inkl. Gästekarte)
- Buchung: direkt online (Smoobu-Kalender auf jeder Apartment-Seite), telefonisch ${site.phoneDisplay} oder per WhatsApp
- Sprachen der Website: Deutsch (Hauptversion), Englisch (/en/), Niederländisch (/nl/), Dänisch (/da/)
- Google-Profil: ${site.googleProfileUrl}

## Apartments (ab-Preise = Nebensaison-Minimum)
${aptLines.join('\n')}

## Wichtige Seiten
- [Alle 7 Apartments im Überblick](${abs('apartments')})
- [Lage & Anfahrt](${abs('lage')})
- [Über uns / Gastgeberin](${abs('ueber-uns')})
- [Kontakt](${abs('kontakt')})
- [AGB & Buchungsbedingungen](${abs('agb')})
- [Ferienwohnung mit Hund in Büsum](${abs('ferienwohnung-buesum-mit-hund')})
- [Ferienwohnung mit Meerblick in Büsum](${abs('ferienwohnung-buesum-meerblick')})
- [Büsum in der Nebensaison](${abs('ferienwohnung-buesum-nebensaison')})

## Reiseführer Büsum (Deutsch)
${guideLines.join('\n')}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
