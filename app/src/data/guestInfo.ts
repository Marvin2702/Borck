// =========================================================================
// GAST-INFORMATIONEN — die Pflege-Datei für Iris & Marvin.
//
// WICHTIG: Native App und Webexport sind öffentlich lesbare Clients. Deshalb
// gehören hier niemals Tür-/Schlüsselbox-Codes, personenbezogene Daten (PII),
// Zugangsdaten zu privaten/Admin-WLANs oder andere Geheimnisse hinein. Solche
// Angaben ausschließlich vor Ort oder über einen geschützten Kanal mitteilen.
//
// Nicht geheime Hausinfos und lokale Tipps werden hier gepflegt. Einträge mit
// „TODO:" sind Platzhalter und werden in der App nicht als fertige Inhalte
// angezeigt. Der Test in __tests__/guestInfo.test.ts findet sie rekursiv.
// =========================================================================

/**
 * Zugangsdaten bleiben standardmäßig vor Ort. `public-guest` darf nur für ein
 * bewusst öffentliches, vom privaten/Admin-Netz getrenntes Gäste-WLAN genutzt
 * werden; SSID und Passwort landen dann lesbar im App-Bundle und Webexport.
 */
export type WifiInfo =
  | { mode: 'onsite'; accessHint: string }
  | { mode: 'public-guest'; ssid: string; password: string };

export type ApartmentGuestInfo = {
  wifi: WifiInfo;
  /** Nicht geheime Wegbeschreibung/Schritte; keine Tür-/Schlüsselbox-Codes. */
  checkinSteps: string[];
  /** z. B. „Stellplatz Nr. 3, direkt vor der Fahrradgarage" */
  parking: string;
};

const TODO = 'TODO: von Iris eintragen';
const onsiteWifi = (): WifiInfo => ({
  mode: 'onsite',
  accessHint: 'Die WLAN-Zugangsdaten stehen auf der WLAN-Karte in der Wohnung.',
});

export const perApartment: Record<string, ApartmentGuestInfo> = {
  tuerkis: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  saphir: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  bernstein: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  topas: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  rubin: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  opal: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
  smaragd: { wifi: onsiteWifi(), checkinSteps: [TODO], parking: TODO },
};

/** Gästemappe: gilt für alle Wohnungen. Sektionen mit Titel + Absätzen. */
export const gaestemappe: { icon: string; title: string; lines: string[] }[] = [
  {
    icon: '📺',
    title: 'Fernseher & SAT',
    lines: ['TODO: Kurzanleitung TV/SAT (Quelle wählen, Senderliste) eintragen.'],
  },
  {
    icon: '🍽️',
    title: 'Küche & Geschirrspüler',
    lines: ['TODO: Eigenheiten je Küche (Tabs, Programme, Herd) eintragen.'],
  },
  {
    icon: '🌡️',
    title: 'Heizung & Lüften',
    lines: ['TODO: Thermostate, Stoßlüften-Empfehlung (Feuchtigkeit an der Küste) eintragen.'],
  },
  {
    icon: '🧺',
    title: 'Waschmaschine & Trockner',
    lines: ['Gemeinschafts-Waschmaschine und -Trockner (Münzbetrieb).', 'TODO: Standort + Münzen/Preis eintragen.'],
  },
  {
    icon: '🚲',
    title: 'Fahrradgarage',
    lines: ['Abschließbare Fahrradgarage am Haus — der Schlüssel gehört zum Wohnungsschlüsselbund.', 'TODO: genauen Standort/Nummer eintragen.'],
  },
  {
    icon: '🗑️',
    title: 'Mülltrennung',
    lines: ['TODO: Tonnen-Standort und Trennung (Rest, Gelb, Papier, Bio) eintragen.'],
  },
  {
    icon: '🏠',
    title: 'Gut zu wissen im Haus',
    lines: ['Check-out bis 10:00 Uhr, Anreise ab 15:00 Uhr (rund um die Uhr möglich).', 'TODO: Hausregeln (Ruhezeiten, Rauchen, Grillen) eintragen.'],
  },
];

/** Iris' persönliche Tipps — bitte durch echte Empfehlungen ersetzen. */
export const irisTipps: { title: string; text: string }[] = [
  { title: 'TODO: Lieblings-Fischbrötchen', text: 'TODO: Wo gibt es für euch die besten Fischbrötchen am Hafen?' },
  { title: 'TODO: Bäcker am Morgen', text: 'TODO: Nächster Bäcker + Öffnungszeiten.' },
  { title: 'TODO: Restaurant-Empfehlung', text: 'TODO: 1–2 Restaurants, die ihr Gästen ehrlich empfehlt.' },
];

/** Notfall & Praktisches. Die ersten Einträge sind bundesweit gültig. */
export const notfall: { title: string; value: string; tel?: string }[] = [
  { title: 'Notruf (Feuerwehr/Rettung)', value: '112', tel: '112' },
  { title: 'Polizei', value: '110', tel: '110' },
  { title: 'Ärztlicher Bereitschaftsdienst', value: '116 117', tel: '116117' },
  { title: 'Giftnotruf (Nord)', value: '0551 19240', tel: '055119240' },
  { title: 'Apotheken-Notdienst', value: 'TODO: nächste Notdienst-Apotheke/Hinweis eintragen' },
  { title: 'Hausarzt in Büsum', value: TODO },
  { title: 'Tierarzt (für Hunde-Gäste)', value: TODO },
];

/** Abreise-Checkliste (Häkchen werden lokal gespeichert). */
export const checkoutChecklist: string[] = [
  'Geschirr gespült und eingeräumt',
  'Müll in die Tonnen gebracht',
  'Fenster geschlossen, Heizung runtergedreht',
  'Kühlschrank geleert',
  'Alle Schlüssel zurück (inkl. Fahrradgarage)',
  'TODO: eigene Punkte ergänzen (z. B. Schlüsselbox-Code zurückstellen)',
];

/** Gezeiten-Infoseite: v1 statisch + offizieller Link. */
export const gezeiten = {
  intro:
    'An der Nordsee bestimmt die Tide den Tag: Etwa alle 6 Stunden wechseln Ebbe und Flut. Wattwandern geht nur um Niedrigwasser — und nur mit Ortskenntnis oder geführt. Baden in der Perlebucht ist dank Lagune tideunabhängig möglich.',
  hinweis:
    'Verbindliche Zeiten liefert der amtliche Gezeitenkalender des BSH für Büsum — einmal antippen, aktuelle Woche ansehen.',
  linkLabel: 'Gezeiten & Wasserstand Büsum (BSH, amtlich)',
  linkUrl: 'https://wasserstand-nordsee.bsh.de/buesum_schleuse',
};
