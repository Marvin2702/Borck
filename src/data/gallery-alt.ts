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

export function galleryImageAlt(src: string, apartment: string, lang: Lang, fallbackView: string): string {
  const filename = src.split('/').pop() ?? '';
  const motif = motifs[filename]?.[lang];
  if (motif) return `${apartment} – ${motif}`;
  const fallback: Record<Lang, string> = {
    de: `Ferienwohnung ${apartment} – ${fallbackView} in Büsum`,
    en: `${apartment} holiday apartment – ${fallbackView} in Büsum`,
    nl: `Vakantieappartement ${apartment} – ${fallbackView} in Büsum`,
    da: `Ferielejlighed ${apartment} – ${fallbackView} i Büsum`,
  };
  return fallback[lang];
}
