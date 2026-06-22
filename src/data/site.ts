// =========================================================================
// Stammdaten (Single Source of Truth) — NAP, Geo, Kontakt, Zusatzleistungen.
// Wird für Footer, Kontaktseite, JSON-LD (LodgingBusiness) verwendet.
// TODO Auftraggeber: Adresse/Geo/Smoobu-IDs final bestätigen.
// =========================================================================

export const site = {
  name: 'Haus Aquamarin',
  legalName: 'Haus Aquamarin Büsum', // TODO: vollständige Firmierung aus Impressum
  domain: 'https://www.nordsee-buesum-fewo.de',
  tagline: 'Ferienapartments direkt am Deich · Büsum',

  // Kontakt
  phone: '+49 172 7952082',
  phoneDisplay: '+49 172 7952082',
  email: 'info@nordsee-buesum-fewo.de', // TODO bestätigen
  whatsapp: '491727952082',

  // Social
  facebook: 'https://www.facebook.com/', // TODO: echte Seite
  instagram: '', // optional

  // Adresse (TODO: exakte Anschrift aus Impressum übernehmen)
  address: {
    street: 'Am Deich', // TODO
    postalCode: '25761',
    city: 'Büsum',
    region: 'Schleswig-Holstein',
    country: 'DE',
  },

  // Geo (Büsum Zentrum – TODO: exakte Objekt-Koordinaten)
  geo: { lat: 54.1336, lng: 8.8575 },

  // Aggregat-Bewertung (aus Google – TODO: Live-Werte pflegen)
  rating: { value: 5.0, count: 9 },

  priceRange: '€€',

  // Zusatzleistungen (aus Bestandsseite)
  extras: [
    { label: 'Bettwäsche', price: 12, unit: 'pro Person' },
    { label: 'Handtücher', price: 9, unit: 'pro Satz' },
    { label: 'Hund (1)', price: 46, unit: 'pro Buchung' },
    { label: 'Hund (2)', price: 23, unit: 'pro Buchung' },
  ],

  // Globale Smoobu-Buchungsseite (alle Objekte). TODO: echte ID eintragen.
  smoobuGroupId: '' as string,
} as const;

export type Site = typeof site;
