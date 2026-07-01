// =========================================================================
// Lokalisierung der Zusatzleistungen/Optionen (Preise stehen in site.ts).
// Keys stabil (id / unit-key); Preise sprachunabhängig, Labels & Einheiten je Sprache.
// =========================================================================
import type { Lang } from '../i18n/utils';

export const extraLabels: Record<string, Record<Lang, string>> = {
  linen:     { de: 'Bettwäsche', en: 'Bed linen', nl: 'Beddengoed', da: 'Sengetøj' },
  towels:    { de: 'Handtücher', en: 'Towels', nl: 'Handdoeken', da: 'Håndklæder' },
  dog1:      { de: 'Hund (1.)', en: 'Dog (1st)', nl: 'Hond (1e)', da: 'Hund (1.)' },
  dog2:      { de: 'Hund (2.)', en: 'Dog (2nd)', nl: 'Hond (2e)', da: 'Hund (2.)' },
  cot:       { de: 'Babybett', en: 'Cot', nl: 'Babybed', da: 'Barneseng' },
  highchair: { de: 'Hochstuhl', en: 'High chair', nl: 'Kinderstoel', da: 'Højstol' },
  shortStay: {
    de: 'Kurzreise-Zuschlag (unter 5 Nächten)',
    en: 'Short-stay surcharge (under 5 nights)',
    nl: 'Toeslag korte reis (minder dan 5 nachten)',
    da: 'Tillæg for kort ophold (under 5 nætter)',
  },
};

export const extraUnits: Record<string, Record<Lang, string>> = {
  perPerson:  { de: 'pro Person', en: 'per person', nl: 'per persoon', da: 'pr. person' },
  perSet:     { de: 'pro Satz', en: 'per set', nl: 'per set', da: 'pr. sæt' },
  perBooking: { de: 'pro Buchung', en: 'per booking', nl: 'per boeking', da: 'pr. booking' },
  perStay:    { de: 'pro Aufenthalt', en: 'per stay', nl: 'per verblijf', da: 'pr. ophold' },
  oneOff:     { de: 'einmalig', en: 'one-off', nl: 'eenmalig', da: 'engangsbeløb' },
};

export function trExtra(id: string, lang: Lang): string {
  return extraLabels[id]?.[lang] ?? id;
}
export function trUnit(unit: string, lang: Lang): string {
  return extraUnits[unit]?.[lang] ?? unit;
}
