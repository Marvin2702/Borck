import type { Lang } from '../i18n/utils';

type Motif = Record<Lang, string>;

const motifs: Record<string, Motif> = {
  'bernstein-1.jpg': { de: 'heller Wohn- und Essbereich mit Terrassentür', en: 'bright living and dining area with patio door', nl: 'lichte woon- en eetkamer met terrasdeur', da: 'lys stue og spiseplads med terrassedør' },
  'bernstein-2.jpg': { de: 'gemütliche Sofaecke mit türkisfarbenen Akzenten', en: 'cosy sofa corner with turquoise accents', nl: 'gezellige zithoek met turquoise accenten', da: 'hyggeligt sofahjørne med turkise detaljer' },
  'opal-1.jpg': { de: 'großzügiger Wohnbereich mit Sitzgruppe und Balkonzugang', en: 'spacious living area with seating and balcony access', nl: 'ruime woonkamer met zithoek en toegang tot het balkon', da: 'rummelig stue med siddegruppe og adgang til balkon' },
  'opal-2.jpg': { de: 'offener Wohn-, Ess- und Küchenbereich unter dem Dach', en: 'open-plan living, dining and kitchen area under the roof', nl: 'open woon-, eet- en keukengedeelte onder het dak', da: 'åbent opholds-, spise- og køkkenområde under taget' },
  'rubin-1.jpg': { de: 'sonniger Essplatz an der offenen Küche', en: 'sunny dining area beside the open kitchen', nl: 'zonnige eethoek naast de open keuken', da: 'solrig spiseplads ved det åbne køkken' },
  'saphir-1.jpg': { de: 'helles Wohnzimmer mit großer Terrassentür', en: 'bright living room with large patio door', nl: 'lichte woonkamer met grote terrasdeur', da: 'lys stue med stor terrassedør' },
  'saphir-2.jpg': { de: 'offener Wohnraum mit moderner Küche und Essplatz', en: 'open living space with modern kitchen and dining area', nl: 'open woonruimte met moderne keuken en eethoek', da: 'åbent opholdsrum med moderne køkken og spiseplads' },
  'smaragd-1.jpg': { de: 'Wohnbereich unter dem Dach mit Sofa und Balkon', en: 'attic living area with sofa and balcony', nl: 'woonkamer onder het dak met bank en balkon', da: 'stue under taget med sofa og balkon' },
  'smaragd-2.jpg': { de: 'kompakter Wohnbereich mit Küchenzeile und Balkonzugang', en: 'compact living area with kitchenette and balcony access', nl: 'compacte woonkamer met kitchenette en toegang tot het balkon', da: 'kompakt opholdsrum med tekøkken og adgang til balkon' },
  'smaragd-3.jpg': { de: 'sonniger kleiner Balkon hinter der Terrassentür', en: 'sunny small balcony beyond the patio door', nl: 'zonnig klein balkon achter de terrasdeur', da: 'solrig lille balkon bag terrassedøren' },
  'topas-1.jpg': { de: 'Wohnzimmer im Dachgeschoss mit Balkon und Weitblick', en: 'top-floor living room with balcony and open view', nl: 'woonkamer op de bovenste verdieping met balkon en vrij uitzicht', da: 'stue på øverste etage med balkon og frit udsyn' },
  'topas-2.jpg': { de: 'Meer- und Deichblick in Richtung Familienlagune', en: 'sea and dyke view towards the family lagoon', nl: 'uitzicht op zee en de dijk richting de familielagune', da: 'udsigt over hav og dige mod familielagunen' },
  'tuerkis-1.jpg': { de: 'moderner Essbereich in Schwarz und Weiß', en: 'modern black-and-white dining area', nl: 'moderne zwart-witte eethoek', da: 'moderne sort-hvid spiseplads' },
  'tuerkis-2.jpg': { de: 'offener Wohnbereich mit weißer Küche und Sofaecke', en: 'open living area with white kitchen and sofa corner', nl: 'open woonkamer met witte keuken en zithoek', da: 'åbent opholdsrum med hvidt køkken og sofahjørne' },
};

const importedMotifs: Record<string, Motif> = {
  'living-terrace': { de: 'heller Wohn- und Essbereich mit Zugang zur Terrasse', en: 'bright living and dining area with terrace access', nl: 'lichte woon- en eetkamer met toegang tot het terras', da: 'lys stue og spiseplads med adgang til terrassen' },
  'sofa': { de: 'gemütliche Sofaecke', en: 'cosy sofa corner', nl: 'gezellige zithoek', da: 'hyggeligt sofahjørne' },
  'dining': { de: 'Essbereich mit Sitzplätzen', en: 'dining area with seating', nl: 'eethoek met zitplaatsen', da: 'spiseplads med siddepladser' },
  'kitchen': { de: 'voll ausgestatteter Küchenbereich', en: 'fully equipped kitchen area', nl: 'volledig uitgeruste keuken', da: 'fuldt udstyret køkkenområde' },
  'bedroom': { de: 'Schlafzimmer mit Doppelbett', en: 'bedroom with double bed', nl: 'slaapkamer met tweepersoonsbed', da: 'soveværelse med dobbeltseng' },
  'bathroom': { de: 'Badezimmer mit Dusche und Waschtisch', en: 'bathroom with shower and washbasin', nl: 'badkamer met douche en wastafel', da: 'badeværelse med bruser og håndvask' },
  'entrance': { de: 'privater Eingangsbereich', en: 'private entrance area', nl: 'privé-ingang', da: 'privat indgangsparti' },
  'living': { de: 'großzügiger Wohnbereich', en: 'spacious living area', nl: 'ruime woonkamer', da: 'rummelig stue' },
  'dyke-view': { de: 'direkter Deichblick vom Balkon', en: 'direct dyke view from the balcony', nl: 'direct uitzicht op de dijk vanaf het balkon', da: 'direkte udsigt til diget fra balkonen' },
  'balcony-view': { de: 'seitlicher Deichblick vom Balkon', en: 'side view of the dyke from the balcony', nl: 'zijdelings uitzicht op de dijk vanaf het balkon', da: 'udsigt til diget fra siden af balkonen' },
  'bedroom-wardrobe': { de: 'Schlafzimmer mit Kleiderschrank und Spiegel', en: 'bedroom with wardrobe and mirror', nl: 'slaapkamer met kledingkast en spiegel', da: 'soveværelse med garderobe og spejl' },
  'bunk-room': { de: 'Kinderzimmer mit Etagenbett', en: "children's room with bunk bed", nl: 'kinderkamer met stapelbed', da: 'børneværelse med køjeseng' },
  'dining-kitchen': { de: 'offene Küche mit Essplatz für vier Personen', en: 'open kitchen with dining space for four', nl: 'open keuken met eethoek voor vier personen', da: 'åbent køkken med spiseplads til fire' },
  'lounge': { de: 'gemütliche Sitzecke im Wohnzimmer', en: 'cosy seating area in the living room', nl: 'gezellige zithoek in de woonkamer', da: 'hyggelig siddegruppe i stuen' },
  'rain-shower': { de: 'modernes Bad mit Regendusche', en: 'modern bathroom with rain shower', nl: 'moderne badkamer met regendouche', da: 'moderne badeværelse med regnbruser' },
  'open-living': { de: 'offener Wohnbereich mit Blick zur Küche', en: 'open living area looking towards the kitchen', nl: 'open woonkamer met zicht op de keuken', da: 'åbent opholdsrum med kig mod køkkenet' },
  'garden-view': { de: 'Wohnzimmer mit Terrassentür und Gartenblick', en: 'living room with patio door and garden view', nl: 'woonkamer met terrasdeur en uitzicht op de tuin', da: 'stue med terrassedør og udsigt til haven' },
  'open-studio': { de: 'offener Wohn-, Ess- und Schlafbereich', en: 'open-plan living, dining and sleeping area', nl: 'open woon-, eet- en slaapgedeelte', da: 'åbent opholds-, spise- og soveområde' },
  'sleeping-area': { de: 'heller Schlafbereich unter dem Dach', en: 'bright sleeping area under the roof', nl: 'lichte slaapruimte onder het dak', da: 'lyst soveområde under taget' },
  'balcony': { de: 'Balkon mit Gartenmöbeln', en: 'balcony with outdoor furniture', nl: 'balkon met tuinmeubilair', da: 'balkon med havemøbler' },
  'living-view': { de: 'Wohnzimmer im Dachgeschoss mit Balkon und Nordseeblick', en: 'top-floor living room with balcony and North Sea view', nl: 'woonkamer op de bovenste verdieping met balkon en uitzicht op de Noordzee', da: 'stue på øverste etage med balkon og udsigt over Nordsøen' },
  'sea-view': { de: 'Meer- und Deichblick in Richtung Familienlagune', en: 'sea and dyke view towards the family lagoon', nl: 'uitzicht op zee en de dijk richting de familielagune', da: 'udsigt over hav og dige mod familielagunen' },
  'dining-kids': { de: 'Essbereich mit Blick in das Dreibettzimmer', en: 'dining area looking into the three-bed room', nl: 'eethoek met zicht op de kamer met drie bedden', da: 'spiseplads med kig til værelset med tre senge' },
  'kids-room': { de: 'Kinderzimmer mit drei Einzelbetten', en: "children's room with three single beds", nl: 'kinderkamer met drie eenpersoonsbedden', da: 'børneværelse med tre enkeltsenge' },
  'living-kitchen': { de: 'moderner Wohnbereich mit Blick auf die Küche', en: 'modern living area looking towards the kitchen', nl: 'moderne woonkamer met zicht op de keuken', da: 'moderne opholdsrum med kig mod køkkenet' },
  'living-tv': { de: 'Wohnbereich mit Smart-TV', en: 'living area with smart TV', nl: 'woonkamer met smart-tv', da: 'opholdsrum med smart-tv' },
  'dining-living': { de: 'Essbereich mit Blick in das Wohnzimmer', en: 'dining area looking into the living room', nl: 'eethoek met zicht op de woonkamer', da: 'spiseplads med kig ind i stuen' },
};

export function galleryImageAlt(src: string, apartment: string, lang: Lang, fallbackView: string): string {
  const filename = src.split('/').pop() ?? '';
  const motif = motifs[filename]?.[lang];
  if (motif) return `${apartment} – ${motif}`;
  const importedSlug = filename.replace(/\.(?:jpe?g|png|webp)$/i, '').replace(/^[^-]+-/, '');
  const importedMotif = importedMotifs[importedSlug]?.[lang];
  if (importedMotif) return `${apartment} – ${importedMotif}`;
  const fallback: Record<Lang, string> = {
    de: `Ferienwohnung ${apartment} – ${fallbackView} in Büsum`,
    en: `${apartment} holiday apartment – ${fallbackView} in Büsum`,
    nl: `Vakantieappartement ${apartment} – ${fallbackView} in Büsum`,
    da: `Ferielejlighed ${apartment} – ${fallbackView} i Büsum`,
  };
  return fallback[lang];
}
