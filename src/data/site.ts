// =========================================================================
// Stammdaten (Single Source of Truth) — NAP, Geo, Kontakt, Impressum.
// Quelle: Originalseite nordsee-buesum-fewo.de (Stand 06/2026).
// =========================================================================

export const site = {
  name: 'Haus Aquamarin',
  legalName: 'Iris Borck-Martin',
  domain: 'https://www.nordsee-buesum-fewo.de',
  tagline: 'Ferienapartments direkt hinter der Familienlagune · Büsum',

  // Kontakt
  phone: '+49 172 7952082',
  phoneDisplay: '+49 172 7952082',
  email: 'iris_borck@mac.com',
  whatsapp: '491727952082',

  // Social
  facebook: 'https://www.facebook.com/IrisBorck',
  instagram: '',

  // Objekt-Anschrift (wo die Apartments liegen – für Gäste & LodgingBusiness)
  address: {
    street: 'Große Tiefe 31',
    postalCode: '25761',
    city: 'Büsum',
    region: 'Schleswig-Holstein',
    country: 'DE',
  },

  // Geo (Büsum, nahe Familienlagune Perlebucht – TODO: exakte Objekt-Koordinaten)
  geo: { lat: 54.1336, lng: 8.8575 },

  // Aggregat-Bewertung (Google – TODO: Live-Werte pflegen)
  rating: { value: 5.0, count: 8 },

  priceRange: '€€',

  // An-/Abreise (aus AGB)
  checkinTime: '15:00',
  checkoutTime: '10:00',

  // Zusatzleistungen (aus Original-Buchungsbedingungen)
  extras: [
    { label: 'Bettwäsche', price: 12, unit: 'pro Person' },
    { label: 'Handtücher', price: 9, unit: 'pro Satz' },
    { label: 'Hund (1.)', price: 46, unit: 'pro Buchung' },
    { label: 'Hund (2.)', price: 23, unit: 'pro Buchung' },
    { label: 'Babybett', price: 5, unit: 'pro Aufenthalt' },
    { label: 'Hochstuhl', price: 5, unit: 'pro Aufenthalt' },
    { label: 'Kurzreise-Zuschlag (unter 5 Nächten)', price: 85, unit: 'einmalig' },
  ],

  // Impressum / Betreiber-Anschrift (abweichend von der Objekt-Adresse)
  impressum: {
    operator: 'Iris Borck-Martin',
    street: 'Rehdamm 2',
    postalCode: '25746',
    city: 'Heide',
    country: 'Deutschland',
    phone: '0481 / 2040',
    phoneAlt: '0172 / 7952082',
    email: 'iris_borck@mac.com',
    ustId: 'DE340109304',
  },

  // Google: GA4-Mess-ID (z. B. "G-XXXXXXXXXX") und Search-Console-Verifizierung.
  // GA lädt NUR nach Einwilligung im Consent-Banner. Leer => kein Analytics, kein Banner.
  googleAnalyticsId: '' as string,
  googleSiteVerification: '' as string,

  // Web3Forms Access-Key für das Kontaktformular (statischer Versand ohne Backend).
  // Kostenlos unter https://web3forms.com (E-Mail eintragen, Key erhalten).
  // Leer => Formular nutzt mailto-Fallback. TODO: Key eintragen.
  formAccessKey: '' as string,

  // Smoobu-Account-ID (Booking-Tool-iFrame: .../booking-tool/iframe/{userId}/{apartmentId}).
  smoobuUserId: '40536',
  // Direkte Smoobu-Buchungsseite (1-Klick): + "?apartmentId={id}" für ein Apartment.
  smoobuBookingPage: 'https://booking.smoobu.com/9A40536',
  // Optionale Sammel-/Such-Buchungsmaschine über alle Objekte (falls vorhanden).
  smoobuGroupId: '' as string,
} as const;

export type Site = typeof site;
