// =========================================================================
// Übersetzungen der Apartment-Inhalte (view/summary/description) für EN/NL/DA.
// Deutsch ist die Quelle in den .md-Dateien. Schlüssel = Apartment-Slug (Datei-ID).
// Ausstattung (features) wird über das Wörterbuch unten übersetzt.
// =========================================================================
import type { Lang } from '../i18n/utils';

type AptText = { view: string; summary: string; description: string };

export const aptI18n: Record<string, Partial<Record<Lang, AptText>>> = {
  tuerkis: {
    en: { view: 'Dyke view', summary: 'Coastal gold for 4. A holiday with dyke views.', description: 'Stylish first-floor apartment with a small balcony and dyke view, an open kitchen (incl. large dishwasher) and a family-friendly layout for up to 4 guests. Two bedrooms, about 57 m², just 0.4 km to the Perlebucht family lagoon.' },
    nl: { view: 'Dijkzicht', summary: 'Kustgoud voor 4 personen. Vakantie met dijkzicht.', description: 'Stijlvol appartement op de eerste verdieping met klein balkon en dijkzicht, open keuken (incl. grote vaatwasser) en gezinsvriendelijke indeling voor max. 4 personen. Twee slaapkamers, ca. 57 m², op slechts 0,4 km van de familielagune Perlebucht.' },
    da: { view: 'Digudsigt', summary: 'Kystguld til 4 personer. Ferie med digudsigt.', description: 'Stilfuld lejlighed på 1. sal med lille altan og digudsigt, åbent køkken (inkl. stor opvaskemaskine) og familievenlig indretning til op til 4 personer. To soveværelser, ca. 57 m², kun 0,4 km til familielagunen Perlebucht.' },
  },
  saphir: {
    en: { view: 'Terrace · garden view', summary: 'A sunny retreat for 4. Your time out with a private terrace.', description: 'Bright, cosy ground-floor apartment with terrace, open kitchen and 2 bedrooms, ideal for up to 4 guests. Quiet yet close to the Perlebucht family lagoon (approx. 0.4 km).' },
    nl: { view: 'Terras · tuinzicht', summary: 'Een zonnige plek voor 4 personen. Jouw rust met een eigen terras.', description: 'Licht, gezellig appartement op de begane grond met terras, open keuken en 2 slaapkamers, ideaal voor max. 4 personen. Rustig en toch dicht bij de familielagune Perlebucht (ca. 0,4 km).' },
    da: { view: 'Terrasse · haveudsigt', summary: 'Et solrigt sted til 4 personer. Din pause med egen terrasse.', description: 'Lys, hyggelig stuelejlighed med terrasse, åbent køkken og 2 soveværelser, ideel til op til 4 personer. Roligt og alligevel tæt på familielagunen Perlebucht (ca. 0,4 km).' },
  },
  bernstein: {
    en: { view: 'Terrace · private entrance', summary: 'A mooring for barefoot souls. Ground-floor escape with a private terrace.', description: 'Compact, cosy ground-floor apartment with terrace and private entrance. Ideal for up to 2 guests, quiet yet close to the Perlebucht family lagoon (approx. 0.4 km).' },
    nl: { view: 'Terras · eigen ingang', summary: 'Ankerplaats voor blootsvoeters. Rust op de begane grond met eigen terras.', description: 'Compact, gezellig appartement op de begane grond met terras en eigen ingang. Ideaal voor max. 2 personen, rustig en toch dicht bij de familielagune Perlebucht (ca. 0,4 km).' },
    da: { view: 'Terrasse · separat indgang', summary: 'Ankerplads for barfodsvenner. Pause i stueetagen med egen terrasse.', description: 'Kompakt, hyggelig stuelejlighed med terrasse og separat indgang. Ideel til op til 2 personer, roligt og alligevel tæt på familielagunen Perlebucht (ca. 0,4 km).' },
  },
  topas: {
    en: { view: 'Sea view', summary: 'Your box seat above the surf. North Sea feeling for 5 with sea views.', description: 'Spacious apartment on the second (top) floor with a small balcony and sea view. Two bedrooms (1 double, 1 with three single beds) for up to 5 guests. Whoever lives at the top sees the sea first. Around 76 m², just 0.4 km to the Perlebucht family lagoon.' },
    nl: { view: 'Zeezicht', summary: 'Jouw loge boven de branding. Noordzeegevoel voor 5 personen met zeezicht.', description: 'Ruim appartement op de tweede (bovenste) verdieping met klein balkon en zeezicht. Twee slaapkamers (1 tweepersoons, 1 met drie eenpersoonsbedden) voor max. 5 personen. Wie bovenaan woont, ziet de zee het eerst. Ca. 76 m², op 0,4 km van de familielagune Perlebucht.' },
    da: { view: 'Havudsigt', summary: 'Din logeplads over brændingen. Nordsø-stemning til 5 personer med havudsigt.', description: 'Rummelig lejlighed på 2. (øverste) sal med lille altan og havudsigt. To soveværelser (1 dobbelt, 1 med tre enkeltsenge) til op til 5 personer. Den, der bor øverst, ser havet først. Ca. 76 m², kun 0,4 km til familielagunen Perlebucht.' },
  },
  rubin: {
    en: { view: 'Terrace · by the dyke', summary: 'Family bliss by the dyke. Your cosy mooring for 4.', description: 'Family-friendly ground-floor apartment with terrace, open kitchen and 2 bedrooms, ideal for up to 4 guests. Quiet yet close to the Perlebucht family lagoon (approx. 0.4 km).' },
    nl: { view: 'Terras · aan de dijk', summary: 'Familiegeluk aan de dijk. Jouw gezellige ankerplaats voor 4 personen.', description: 'Gezinsvriendelijk appartement op de begane grond met terras, open keuken en 2 slaapkamers, ideaal voor max. 4 personen. Rustig en toch dicht bij de familielagune Perlebucht (ca. 0,4 km).' },
    da: { view: 'Terrasse · ved diget', summary: 'Familielykke ved diget. Din hyggelige ankerplads til 4 personer.', description: 'Familievenlig stuelejlighed med terrasse, åbent køkken og 2 soveværelser, ideel til op til 4 personer. Roligt og alligevel tæt på familielagunen Perlebucht (ca. 0,4 km).' },
  },
  opal: {
    en: { view: 'Two balconies · dyke view', summary: 'Dyke cinema for 4. Double balcony bliss with wide views.', description: 'Bright first-floor apartment with two balconies, one with a wide dyke view. Two bedrooms, ideal for up to 4 guests. Why settle for one balcony when you can have two? Around 55 m², only 0.4 km to the lagoon.' },
    nl: { view: 'Twee balkons · dijkzicht', summary: 'Dijkcinema voor 4 personen. Dubbel balkongeluk met weids uitzicht.', description: 'Licht appartement op de eerste verdieping met twee balkons, een met weids dijkzicht. Twee slaapkamers, ideaal voor max. 4 personen. Waarom één balkon als je er twee kunt hebben? Ca. 55 m², op 0,4 km van de lagune.' },
    da: { view: 'To altaner · digudsigt', summary: 'Dige-biograf til 4 personer. Dobbelt altanlykke med vidt udsyn.', description: 'Lys lejlighed på 1. sal med to altaner, en med vidt digudsigt. To soveværelser, ideel til op til 4 personer. Hvorfor nøjes med én altan, når du kan få to? Ca. 55 m², kun 0,4 km til lagunen.' },
  },
  smaragd: {
    en: { view: 'Side dyke view', summary: 'Your loft under the coastal sky. Compact holiday joy for 2 with a side dyke view.', description: 'Charming studio on the first floor with its own entrance and a balcony with a side dyke view. Ideal for up to 2 guests, quiet yet close to the Perlebucht family lagoon (approx. 0.4 km).' },
    nl: { view: 'Zijdelings dijkzicht', summary: 'Jouw loft onder de kustlucht. Compact vakantiegeluk voor 2 met zijdelings dijkzicht.', description: 'Charmante studio op de eerste verdieping met eigen ingang en balkon met zijdelings dijkzicht. Ideaal voor max. 2 personen, rustig en toch dicht bij de familielagune Perlebucht (ca. 0,4 km).' },
    da: { view: 'Digudsigt fra siden', summary: 'Dit loft under kysthimlen. Kompakt ferielykke til 2 med digudsigt fra siden.', description: 'Charmerende etværelses på 1. sal med egen indgang og altan med digudsigt fra siden. Ideel til op til 2 personer, roligt og alligevel tæt på familielagunen Perlebucht (ca. 0,4 km).' },
  },
};

// Ausstattungs-Wörterbuch (DE-Originalstring -> Übersetzung). Fallback: Original.
export const featureI18n: Record<string, Partial<Record<Lang, string>>> = {
  'Balkon mit Deichblick': { en: 'Balcony with dyke view', nl: 'Balkon met dijkzicht', da: 'Altan med digudsigt' },
  'Offene Einbauküche mit großem Geschirrspüler': { en: 'Open fitted kitchen with large dishwasher', nl: 'Open keuken met grote vaatwasser', da: 'Åbent køkken med stor opvaskemaskine' },
  '4-Zonen-Induktionskochfeld': { en: '4-zone induction hob', nl: 'Inductiekookplaat met 4 zones', da: 'Induktionskogeplade med 4 zoner' },
  'Doppelbett 180 cm + Etagenbett': { en: 'Double bed 180 cm + bunk bed', nl: 'Tweepersoonsbed 180 cm + stapelbed', da: 'Dobbeltseng 180 cm + køjeseng' },
  'Duschbad mit Haartrockner': { en: 'Shower bathroom with hairdryer', nl: 'Badkamer met douche en föhn', da: 'Badeværelse med bruser og hårtørrer' },
  'Flachbild-TV mit SAT': { en: 'Flat-screen TV with satellite', nl: 'Flatscreen-tv met satelliet', da: 'Fladskærms-tv med satellit' },
  'Kostenloses WLAN': { en: 'Free Wi-Fi', nl: 'Gratis wifi', da: 'Gratis wi-fi' },
  'PKW-Stellplatz & abschließbare Fahrradgarage': { en: 'Parking space & lockable bike garage', nl: 'Parkeerplaats & afsluitbare fietsenstalling', da: 'Parkeringsplads & aflåselig cykelgarage' },
  'Eigene Terrasse (ca. 60 m²) mit Gartenblick': { en: 'Private terrace (approx. 60 m²) with garden view', nl: 'Eigen terras (ca. 60 m²) met tuinzicht', da: 'Egen terrasse (ca. 60 m²) med haveudsigt' },
  'Offene Einbauküche mit Geschirrspüler': { en: 'Open fitted kitchen with dishwasher', nl: 'Open keuken met vaatwasser', da: 'Åbent køkken med opvaskemaskine' },
  'Induktionskochfeld & Backofen mit Mikrowelle': { en: 'Induction hob & oven with microwave', nl: 'Inductiekookplaat & oven met magnetron', da: 'Induktionskogeplade & ovn med mikrobølge' },
  'Flachbild-TV mit SAT, DAB+ Radio': { en: 'Flat-screen TV with satellite, DAB+ radio', nl: 'Flatscreen-tv met satelliet, DAB+ radio', da: 'Fladskærms-tv med satellit, DAB+ radio' },
  'Eigene Terrasse (ca. 35 m²)': { en: 'Private terrace (approx. 35 m²)', nl: 'Eigen terras (ca. 35 m²)', da: 'Egen terrasse (ca. 35 m²)' },
  'Separater privater Eingang, Anreise rund um die Uhr': { en: 'Separate private entrance, 24/7 check-in', nl: 'Aparte eigen ingang, 24/7 inchecken', da: 'Separat privat indgang, check-in døgnet rundt' },
  'Offene Küche, 4-Zonen-Kochfeld & Mikrowelle': { en: 'Open kitchen, 4-zone hob & microwave', nl: 'Open keuken, kookplaat met 4 zones & magnetron', da: 'Åbent køkken, kogeplade med 4 zoner & mikrobølge' },
  'Doppelbett 180 cm': { en: 'Double bed 180 cm', nl: 'Tweepersoonsbed 180 cm', da: 'Dobbeltseng 180 cm' },
  'Balkon mit Meerblick': { en: 'Balcony with sea view', nl: 'Balkon met zeezicht', da: 'Altan med havudsigt' },
  'Offene Einbauküche, Mini-Geschirrspüler & Mikrowelle mit Grill': { en: 'Open fitted kitchen, mini dishwasher & microwave with grill', nl: 'Open keuken, mini-vaatwasser & magnetron met grill', da: 'Åbent køkken, mini-opvaskemaskine & mikrobølge med grill' },
  'Doppelbett 180 cm + 3 Einzelbetten (je 90 cm)': { en: 'Double bed 180 cm + 3 single beds (90 cm each)', nl: 'Tweepersoonsbed 180 cm + 3 eenpersoonsbedden (elk 90 cm)', da: 'Dobbeltseng 180 cm + 3 enkeltsenge (hver 90 cm)' },
  'Gartenmöbel & Sonnenschirm': { en: 'Garden furniture & parasol', nl: 'Tuinmeubels & parasol', da: 'Havemøbler & parasol' },
  'Eigene Terrasse (ca. 60 m²)': { en: 'Private terrace (approx. 60 m²)', nl: 'Eigen terras (ca. 60 m²)', da: 'Egen terrasse (ca. 60 m²)' },
  'Offene Küche, 4-Zonen-Ceranfeld & Backofen': { en: 'Open kitchen, 4-zone ceramic hob & oven', nl: 'Open keuken, keramische kookplaat met 4 zones & oven', da: 'Åbent køkken, keramisk kogeplade med 4 zoner & ovn' },
  'Zwei Balkone (einer mit weitem Deichblick)': { en: 'Two balconies (one with a wide dyke view)', nl: 'Twee balkons (een met weids dijkzicht)', da: 'To altaner (en med vidt digudsigt)' },
  'Offene Einbauküche & Mini-Geschirrspüler': { en: 'Open fitted kitchen & mini dishwasher', nl: 'Open keuken & mini-vaatwasser', da: 'Åbent køkken & mini-opvaskemaskine' },
  'Gartenmöbel': { en: 'Garden furniture', nl: 'Tuinmeubels', da: 'Havemøbler' },
  'Balkon mit seitlichem Deichblick & Sonnenschirm': { en: 'Balcony with side dyke view & parasol', nl: 'Balkon met zijdelings dijkzicht & parasol', da: 'Altan med digudsigt fra siden & parasol' },
  'Autarker, separater Eingang': { en: 'Independent, separate entrance', nl: 'Eigen, aparte ingang', da: 'Selvstændig, separat indgang' },
  'Küchenzeile mit Ceran-Kochfeld & Mikrowelle mit Backofenfunktion': { en: 'Kitchenette with ceramic hob & microwave with oven function', nl: 'Kitchenette met keramische kookplaat & magnetron met ovenfunctie', da: 'Tekøkken med keramisk kogeplade & mikrobølge med ovnfunktion' },
  '2 Einzelbetten (90 × 200 cm)': { en: '2 single beds (90 × 200 cm)', nl: '2 eenpersoonsbedden (90 × 200 cm)', da: '2 enkeltsenge (90 × 200 cm)' },
};

/** Lokalisierte Apartment-Texte (undefined => Frontmatter-Deutsch nutzen). */
export function trApt(id: string, lang: Lang): AptText | undefined {
  if (lang === 'de') return undefined;
  return aptI18n[id]?.[lang];
}

/** Übersetzt ein Ausstattungsmerkmal (Fallback: Original-DE). */
export function trFeature(feature: string, lang: Lang): string {
  if (lang === 'de') return feature;
  return featureI18n[feature]?.[lang] ?? feature;
}
