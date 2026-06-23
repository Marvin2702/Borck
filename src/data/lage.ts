// =========================================================================
// Lage- & Erlebnis-Daten: 7 Kategorien rund ums Haus Aquamarin (Große Tiefe 31).
// Je Kategorie: Icon, ungefähre Entfernung (Luftlinie/Fußweg, „ca.") sowie
// buchbare/verlinkte Aktivitäten mit echten Anbieter-URLs.
// Entfernungen sind Näherungswerte ab dem Objekt – bei Bedarf exakt nachmessen.
// =========================================================================
import type { Lang } from '../i18n/utils';

export type Activity = { name: string; url: string };

export type LageCard = {
  id: string;
  icon: string;
  distanceKm: number | null; // null => "am Apartment"
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  activities: Record<Lang, Activity[]>;
};

const buesum = 'https://www.buesum.de';

export const lageCards: LageCard[] = [
  {
    id: 'strand',
    icon: '🌊',
    distanceKm: 0.4,
    title: { de: 'Strand & Perlebucht', en: 'Beach & lagoon', nl: 'Strand & lagune', da: 'Strand & lagune' },
    text: {
      de: 'Sandstrand, Familienlagune und Promenade, nur wenige Schritte vom Deich.',
      en: 'Sandy beach, family lagoon and promenade, steps from the dyke.',
      nl: 'Zandstrand, familielagune en promenade, op een paar passen van de dijk.',
      da: 'Sandstrand, familielagune og promenade, få skridt fra diget.',
    },
    activities: {
      de: [
        { name: 'Strandkorb mieten', url: `${buesum}/buesum-erleben/strand/strandkoerbe` },
        { name: 'Familienlagune Perlebucht', url: `${buesum}/buesum-erleben/strand` },
        { name: 'Schlafstrandkorb buchen', url: `${buesum}/buesum-erleben/strand/schlafstrandkorb` },
      ],
      en: [
        { name: 'Rent a beach chair', url: `${buesum}/buesum-erleben/strand/strandkoerbe` },
        { name: 'Perlebucht family lagoon', url: `${buesum}/buesum-erleben/strand` },
        { name: 'Sleep beach chair', url: `${buesum}/buesum-erleben/strand/schlafstrandkorb` },
      ],
      nl: [
        { name: 'Strandstoel huren', url: `${buesum}/buesum-erleben/strand/strandkoerbe` },
        { name: 'Familielagune Perlebucht', url: `${buesum}/buesum-erleben/strand` },
        { name: 'Slaapstrandstoel', url: `${buesum}/buesum-erleben/strand/schlafstrandkorb` },
      ],
      da: [
        { name: 'Lej en strandkurv', url: `${buesum}/buesum-erleben/strand/strandkoerbe` },
        { name: 'Familielagune Perlebucht', url: `${buesum}/buesum-erleben/strand` },
        { name: 'Sove-strandkurv', url: `${buesum}/buesum-erleben/strand/schlafstrandkorb` },
      ],
    },
  },
  {
    id: 'watt',
    icon: '🥾',
    distanceKm: 0.4,
    title: { de: 'Wattwanderung', en: 'Mudflat walk', nl: 'Wadlopen', da: 'Vadehavstur' },
    text: {
      de: 'Geführte Touren ins UNESCO-Weltnaturerbe Wattenmeer direkt vor Büsum.',
      en: 'Guided tours into the UNESCO World Heritage Wadden Sea off Büsum.',
      nl: 'Geleide tochten in het UNESCO-werelderfgoed Waddenzee bij Büsum.',
      da: 'Guidede ture i UNESCO-verdensarven Vadehavet ud for Büsum.',
    },
    activities: {
      de: [
        { name: 'Wattführung „für Alle" (Perlebucht)', url: `${buesum}/veranstaltungen/event/wattwanderung-fuer-alle` },
        { name: 'Alle Wattführungen', url: `${buesum}/buesum-erleben/fuehrungen/wattfuehrungen` },
        { name: 'Online buchen (Wattführer)', url: 'https://www.watterleben.de/' },
      ],
      en: [
        { name: 'Guided mudflat walk "for all"', url: `${buesum}/veranstaltungen/event/wattwanderung-fuer-alle` },
        { name: 'All mudflat tours', url: `${buesum}/buesum-erleben/fuehrungen/wattfuehrungen` },
        { name: 'Book online (guides)', url: 'https://www.watterleben.de/' },
      ],
      nl: [
        { name: 'Begeleide wadlooptocht', url: `${buesum}/veranstaltungen/event/wattwanderung-fuer-alle` },
        { name: 'Alle wadtochten', url: `${buesum}/buesum-erleben/fuehrungen/wattfuehrungen` },
        { name: 'Online boeken', url: 'https://www.watterleben.de/' },
      ],
      da: [
        { name: 'Guidet vadehavstur', url: `${buesum}/veranstaltungen/event/wattwanderung-fuer-alle` },
        { name: 'Alle vadeture', url: `${buesum}/buesum-erleben/fuehrungen/wattfuehrungen` },
        { name: 'Book online', url: 'https://www.watterleben.de/' },
      ],
    },
  },
  {
    id: 'hafen',
    icon: '⚓',
    distanceKm: 1.2,
    title: { de: 'Hafen & Krabben', en: 'Harbour & shrimp', nl: 'Haven & garnalen', da: 'Havn & rejer' },
    text: {
      de: 'Fischkutter, frische Nordseekrabben und Hafenflair zum Schlendern.',
      en: 'Fishing cutters, fresh North Sea shrimp and harbour atmosphere.',
      nl: 'Viskotters, verse Noordzeegarnalen en echte havensfeer.',
      da: 'Fiskekuttere, friske Nordsørejer og ægte havnestemning.',
    },
    activities: {
      de: [
        { name: 'Krabbenfangfahrt', url: 'https://www.adler-eils.de/schiffstouren/fangfahrt.html' },
        { name: 'Schiffsausflüge (Helgoland, Seehunde)', url: `${buesum}/aktivitaeten/schiffsausfluege` },
      ],
      en: [
        { name: 'Shrimp fishing trip', url: 'https://www.adler-eils.de/schiffstouren/fangfahrt.html' },
        { name: 'Boat trips (Helgoland, seals)', url: `${buesum}/aktivitaeten/schiffsausfluege` },
      ],
      nl: [
        { name: 'Garnalenvisserij-tocht', url: 'https://www.adler-eils.de/schiffstouren/fangfahrt.html' },
        { name: 'Boottochten (Helgoland, zeehonden)', url: `${buesum}/aktivitaeten/schiffsausfluege` },
      ],
      da: [
        { name: 'Rejefangst-tur', url: 'https://www.adler-eils.de/schiffstouren/fangfahrt.html' },
        { name: 'Sejlture (Helgoland, sæler)', url: `${buesum}/aktivitaeten/schiffsausfluege` },
      ],
    },
  },
  {
    id: 'deich',
    icon: '🐑',
    distanceKm: 0.1,
    title: { de: 'Deich & Radwege', en: 'Dyke & cycle paths', nl: 'Dijk & fietspaden', da: 'Dige & cykelstier' },
    text: {
      de: 'Endlose Deichwege zum Wandern und Radeln, mit Schafen und Weitblick.',
      en: 'Endless dyke paths for walking and cycling, with sheep and wide views.',
      nl: 'Eindeloze dijkpaden om te wandelen en fietsen, met schapen en weids uitzicht.',
      da: 'Endeløse digestier til gåture og cykling, med får og vid udsigt.',
    },
    activities: {
      de: [
        { name: 'Geführte Rad- & Wandertouren', url: `${buesum}/buesum-erleben/fuehrungen` },
        { name: 'Promenade & Deich (frei)', url: `${buesum}/buesum-erleben/strand` },
      ],
      en: [
        { name: 'Guided bike & walking tours', url: `${buesum}/buesum-erleben/fuehrungen` },
        { name: 'Promenade & dyke (free)', url: `${buesum}/buesum-erleben/strand` },
      ],
      nl: [
        { name: 'Begeleide fiets- & wandeltochten', url: `${buesum}/buesum-erleben/fuehrungen` },
        { name: 'Promenade & dijk (gratis)', url: `${buesum}/buesum-erleben/strand` },
      ],
      da: [
        { name: 'Guidede cykel- & vandreture', url: `${buesum}/buesum-erleben/fuehrungen` },
        { name: 'Promenade & dige (gratis)', url: `${buesum}/buesum-erleben/strand` },
      ],
    },
  },
  {
    id: 'gaestekarte',
    icon: '🎫',
    distanceKm: 0.8,
    title: { de: 'Gästekarte & Kurabgabe', en: 'Guest card & spa tax', nl: 'Gastenkaart & kuurtaks', da: 'Gæstekort & kurafgift' },
    text: {
      de: 'Die Büsumer Gästekarte bringt Ermäßigungen vor Ort; die ortsübliche Kurabgabe wird separat erhoben.',
      en: 'The Büsum guest card brings local discounts; the customary spa tax is charged separately.',
      nl: 'De Büsumer gastenkaart geeft korting ter plaatse; de gebruikelijke kuurtaks wordt apart berekend.',
      da: 'Büsum-gæstekortet giver rabatter på stedet; den sædvanlige kurafgift opkræves separat.',
    },
    activities: {
      de: [
        { name: 'Büsumer Gästekarte (Vorteile)', url: `${buesum}/urlaub-planen/buesumer-gaestekarte` },
        { name: 'Tagesgästekarte online kaufen', url: 'https://tagesgaestekarte.buesum.de/' },
        { name: 'Tourist-Info Watt’n Hus', url: `${buesum}/wattn-hus/tourist-information` },
      ],
      en: [
        { name: 'Büsum guest card (benefits)', url: `${buesum}/urlaub-planen/buesumer-gaestekarte` },
        { name: 'Buy day card online', url: 'https://tagesgaestekarte.buesum.de/' },
        { name: 'Tourist info Watt’n Hus', url: `${buesum}/wattn-hus/tourist-information` },
      ],
      nl: [
        { name: 'Büsumer gastenkaart (voordelen)', url: `${buesum}/urlaub-planen/buesumer-gaestekarte` },
        { name: 'Dagkaart online kopen', url: 'https://tagesgaestekarte.buesum.de/' },
        { name: 'Toeristeninfo Watt’n Hus', url: `${buesum}/wattn-hus/tourist-information` },
      ],
      da: [
        { name: 'Büsum-gæstekort (fordele)', url: `${buesum}/urlaub-planen/buesumer-gaestekarte` },
        { name: 'Køb dagkort online', url: 'https://tagesgaestekarte.buesum.de/' },
        { name: 'Turistinfo Watt’n Hus', url: `${buesum}/wattn-hus/tourist-information` },
      ],
    },
  },
  {
    id: 'anreise',
    icon: '🚗',
    distanceKm: null,
    title: { de: 'Anreise & Parken', en: 'Arrival & parking', nl: 'Aankomst & parkeren', da: 'Ankomst & parkering' },
    text: {
      de: 'Über die A23 bis Heide und weiter nach Büsum. Zu jedem Apartment gehören ein PKW-Stellplatz und eine abschließbare Fahrradgarage.',
      en: 'Via the A23 to Heide and on to Büsum. Each apartment has its own parking space and a lockable bike garage.',
      nl: 'Via de A23 naar Heide en verder naar Büsum. Bij elk appartement horen een parkeerplaats en een afsluitbare fietsenstalling.',
      da: 'Via A23 til Heide og videre til Büsum. Til hver lejlighed hører en parkeringsplads og en aflåselig cykelgarage.',
    },
    activities: {
      de: [
        { name: 'Route planen (Google Maps)', url: 'https://www.google.com/maps/dir/?api=1&destination=Gro%C3%9Fe%20Tiefe%2031%2C%2025761%20B%C3%BCsum' },
        { name: 'Stellplatz & Fahrradgarage inklusive', url: '' },
      ],
      en: [
        { name: 'Plan your route (Google Maps)', url: 'https://www.google.com/maps/dir/?api=1&destination=Gro%C3%9Fe%20Tiefe%2031%2C%2025761%20B%C3%BCsum' },
        { name: 'Parking & bike garage included', url: '' },
      ],
      nl: [
        { name: 'Route plannen (Google Maps)', url: 'https://www.google.com/maps/dir/?api=1&destination=Gro%C3%9Fe%20Tiefe%2031%2C%2025761%20B%C3%BCsum' },
        { name: 'Parkeerplaats & fietsenstalling inbegrepen', url: '' },
      ],
      da: [
        { name: 'Planlæg rute (Google Maps)', url: 'https://www.google.com/maps/dir/?api=1&destination=Gro%C3%9Fe%20Tiefe%2031%2C%2025761%20B%C3%BCsum' },
        { name: 'Parkering & cykelgarage inkluderet', url: '' },
      ],
    },
  },
  {
    id: 'schietwetter',
    icon: '🌧️',
    distanceKm: 0.6,
    title: { de: 'Auch bei Schietwetter', en: 'Even in rough weather', nl: 'Ook bij slecht weer', da: 'Også i dårligt vejr' },
    text: {
      de: 'Das Wellenbad „Meerzeit", der Spa und das Museum am Meer machen Büsum bei jedem Wetter lohnenswert.',
      en: 'The „Meerzeit" wave pool, the spa and the museum by the sea make Büsum worthwhile in any weather.',
      nl: 'Het golfbad „Meerzeit", de spa en het museum aan zee maken Büsum bij elk weer de moeite waard.',
      da: 'Bølgebadet „Meerzeit", spaen og museet ved havet gør Büsum værd at besøge i al slags vejr.',
    },
    activities: {
      de: [
        { name: 'Wellenbad „Meerzeit"', url: `${buesum}/meerzeit/wellenbad` },
        { name: 'Spa „Meerzeit"', url: `${buesum}/meerzeit/spa` },
        { name: 'Museum am Meer', url: `${buesum}/aktivitaeten/museum-am-meer` },
      ],
      en: [
        { name: '„Meerzeit" wave pool', url: `${buesum}/meerzeit/wellenbad` },
        { name: '„Meerzeit" spa', url: `${buesum}/meerzeit/spa` },
        { name: 'Museum am Meer', url: `${buesum}/aktivitaeten/museum-am-meer` },
      ],
      nl: [
        { name: 'Golfbad „Meerzeit"', url: `${buesum}/meerzeit/wellenbad` },
        { name: 'Spa „Meerzeit"', url: `${buesum}/meerzeit/spa` },
        { name: 'Museum am Meer', url: `${buesum}/aktivitaeten/museum-am-meer` },
      ],
      da: [
        { name: 'Bølgebad „Meerzeit"', url: `${buesum}/meerzeit/wellenbad` },
        { name: 'Spa „Meerzeit"', url: `${buesum}/meerzeit/spa` },
        { name: 'Museum am Meer', url: `${buesum}/aktivitaeten/museum-am-meer` },
      ],
    },
  },
];

const distAtHome: Record<Lang, string> = {
  de: 'am Apartment', en: 'at the apartment', nl: 'bij het appartement', da: 'ved lejligheden',
};

/** Formatiert die Entfernung lokalisiert ("ca. 0,4 km" / "approx. 0.4 km"). */
export function formatDistance(km: number | null, lang: Lang): string {
  if (km === null) return distAtHome[lang];
  const num = km.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${lang === 'en' ? 'approx.' : 'ca.'} ${num} km`;
}

export const lageLabels: Record<Lang, { activities: string; open: string; close: string; distance: string }> = {
  de: { activities: 'Aktivitäten & Buchen', open: 'Aktivitäten ansehen', close: 'Schließen', distance: 'Entfernung' },
  en: { activities: 'Activities & booking', open: 'View activities', close: 'Close', distance: 'Distance' },
  nl: { activities: 'Activiteiten & boeken', open: 'Activiteiten bekijken', close: 'Sluiten', distance: 'Afstand' },
  da: { activities: 'Aktiviteter & booking', open: 'Se aktiviteter', close: 'Luk', distance: 'Afstand' },
};
