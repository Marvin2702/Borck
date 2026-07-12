// =========================================================================
// Erlebnis-Ziele rund um Büsum (≤ 20 km) für die Reiseführer-Erlebnis-Karte.
// Recherchiert + geocodiert (OSM/Nominatim), mehrfach quergeprüft; Quellen im
// Research-Log. Entfernungen werden aus den Koordinaten berechnet (Luftlinie).
// =========================================================================
import { site } from './site';
import type { Lang } from '../i18n/utils';

export type Experience = {
  /** Stabile, handvergebene ID — Persistenz-Anker (Gäste-App: Likes/Check-ins). */
  id: string;
  name: string;
  category: string;
  icon: string;
  coords: [number, number]; // [lat, lng]
  area: string;
  description: string; // DE, ein Satz
  url: string; // offizieller/Buchungs-Link
  indoor: boolean;
};

export const experiences: Experience[] = [
  { id: 'perlebucht-lagune', name: 'Familienlagune Perlebucht', category: 'Natur & Strand', icon: '🏖️', coords: [54.1354887, 8.8394263], area: 'Büsum', description: 'Barrierefreie, ganzjährig frei zugängliche Bade- und Strandlagune am Südstrand mit direktem Nordseeblick.', url: 'https://www.familienlagune-perlebucht.de/', indoor: false },
  { id: 'adventure-golf', name: 'Family Fairway – Adventure Golf', category: 'Familie', icon: '⛳', coords: [54.1415273, 8.8444184], area: 'Büsum', description: '18 maritim gestaltete Adventuregolf-Bahnen mit Leuchtturm, Krabbenkutter und Seehundbank – nur wenige Minuten vom Haus.', url: 'https://www.adventuregolf-buesum.de/', indoor: false },
  { id: 'wassersport-schule', name: 'Wassersport Büsum – Kite-, Surf- & SUP-Schule', category: 'Aktiv & Wasser', icon: '🏄', coords: [54.1384261, 8.8383051], area: 'Büsum (Perlebucht)', description: 'VDWS-lizenzierte Schule mit Kursen in Kitesurfen, Windsurfen und SUP im geschützten Sportbecken der Perlebucht.', url: 'https://www.wassersport-buesum.de/', indoor: false },
  { id: 'wattwanderung-schutzstation', name: 'Wattwanderung mit der Schutzstation Wattenmeer', category: 'Natur & Watt', icon: '🥾', coords: [54.1334294, 8.8382073], area: 'Büsum', description: 'Geführte Wattwanderungen ins UNESCO-Weltnaturerbe mit ausgebildeten Nationalpark-Guides, direkt ab Büsum.', url: 'https://www.schutzstation-wattenmeer.de/unsere-stationen/buesum/veranstaltungen-watt-erleben/', indoor: false },
  { id: 'meerzeit-wellenbad', name: 'Meerzeit – Wellenbad & Spa', category: 'Baden & Wellness', icon: '🌊', coords: [54.1281385, 8.8569203], area: 'Büsum', description: 'Modernes Erlebnisbad am Südstrand mit Salzwasser-Wellenbecken, Außenpools und Saunawelt – perfekt bei Schietwetter.', url: 'https://www.buesum.de/meerzeit', indoor: true },
  { id: 'krabbenfangfahrt', name: 'Krabbenfangfahrt mit dem Kutter', category: 'Aktiv & Wasser', icon: '🦐', coords: [54.1282822, 8.8624048], area: 'Büsum', description: 'Rund 1,5-stündige Fangfahrt ab dem Fischerkai: Netz einholen, Fang sortieren und Nordsee-Fischerei hautnah erleben.', url: 'https://www.adler-eils.de/schiffstouren/fangfahrt.html', indoor: false },
  { id: 'helgoland-ausflug', name: 'Tagesausflug nach Helgoland', category: 'Aktiv & Wasser', icon: '🏝️', coords: [54.1296434, 8.865803], area: 'Büsum', description: 'Von April bis Oktober täglich mit der „Funny Girl" ab Büsum zur einzigen deutschen Hochseeinsel – mit Düne und Lummenfelsen.', url: 'https://www.adler-eils.de/schiffstouren/helgoland/', indoor: false },
  { id: 'museum-am-meer', name: 'museum am meer & Aquarium am Hafen', category: 'Museen & Indoor', icon: '🐟', coords: [54.1275877, 8.8636655], area: 'Büsum', description: 'Neu eröffnetes Museum zur Krabbenfischerei und Seebad-Geschichte, verbunden mit dem Nordsee-Aquarium am Fischereihafen.', url: 'https://www.buesum.de/buesum-erleben/poi/museum-am-meer', indoor: true },
  { id: 'seehundsbank-fahrt', name: 'Fahrt zur Seehundsbank', category: 'Aktiv & Wasser', icon: '🦭', coords: [54.1270341, 8.8631939], area: 'Büsum', description: 'Rund zweistündige Schiffstour ab dem Hafen zu einer der größten Seehundsbänke der Nordsee – je nach Tide bis zu 100 Tiere.', url: 'https://www.adler-eils.de/schiffstouren/seehundsb%C3%A4nke.html', indoor: false },
  { id: 'phaenomania', name: 'Phänomania Erlebniszentrum', category: 'Familie', icon: '🔬', coords: [54.1285211, 8.8698562], area: 'Büsum', description: 'Interaktives Mitmach-Museum mit über 230 Experimentierstationen zu Sinnen und Naturwissenschaft (saisonal März–Oktober).', url: 'https://www.phaenomania-buesum.de/', indoor: true },
  { id: 'hafen-leuchtturm', name: 'Büsumer Hafen & Altstadt mit Leuchtturm', category: 'Orte & Kultur', icon: '🚨', coords: [54.1220931, 8.8588978], area: 'Büsum', description: 'Hafen mit großer Krabbenkutterflotte, rot-weißem Leuchtturm von 1913 und spätgotischer St.-Clemens-Kirche.', url: 'https://www.buesum.de/buesum-erleben/kultur-und-sehenswertes', indoor: false },
  { id: 'kartbahn-nordseering', name: 'Nordseering Büsum – Kartbahn', category: 'Aktiv & Familie', icon: '🏎️', coords: [54.1235048, 8.8658055], area: 'Büsum', description: 'Outdoor-Kartbahn am Deich mit einer 900-m-Strecke für Erwachsene und einer 200-m-Kinderbahn.', url: 'https://www.nordseering.de/', indoor: false },
  { id: 'kohlosseum', name: 'KOHLosseum Wesselburen', category: 'Museen & Indoor', icon: '🥬', coords: [54.2052997, 8.932442], area: 'Wesselburen', description: 'In einer ehemaligen Sauerkrautfabrik vereint: Kohlmuseum, Bauernmarkt und Krautwerkstatt mit Vorführungen und Verkostung.', url: 'https://www.kohlosseum.de/', indoor: true },
  { id: 'kronenloch-voegel', name: 'Vogelbeobachtung Kronenloch (Speicherkoog)', category: 'Natur & Watt', icon: '🦅', coords: [54.0834572, 8.9812205], area: 'Meldorf', description: 'Naturschutzgebiet mit Beobachtungsturm und -hütten, in dem im Jahresverlauf rund 250 Vogelarten zu sehen sind.', url: 'https://www.echt-dithmarschen.de/typisch/poi/beobachtungshuette-am-kronenloch-meldorfer-hafen', indoor: false },
  { id: 'seehundstation-friedrichskoog', name: 'Seehundstation Friedrichskoog', category: 'Familie', icon: '🦭', coords: [54.0010419, 8.8758812], area: 'Friedrichskoog', description: 'Offizielle Aufzuchtstation für verwaiste Seehunde und Kegelrobben mit täglichen Fütterungen – ein Muss für Familien.', url: 'https://www.seehundstation-friedrichskoog.de/', indoor: false },
  { id: 'landesmuseum-meldorf', name: 'Dithmarscher Landesmuseum Meldorf', category: 'Orte & Kultur', icon: '🏛️', coords: [54.0914354, 9.0739479], area: 'Meldorf', description: 'Neu gestaltete Dauerausstellung zu rund 1.200 Jahren Dithmarscher Geschichte – von der Bauernrepublik bis in die 1960er.', url: 'https://www.landesmuseum-dithmarschen.de/', indoor: true },
  { id: 'strandkorb-tag', name: 'Strandkorb-Tag am Büsumer Strand', category: 'Natur & Strand', icon: '⛱️', coords: [54.1384261, 8.8383051], area: 'Büsum', description: 'Einen Tag lang Wind und Wellen aus dem eigenen gemieteten Strandkorb genießen – die norddeutsche Antwort auf die Sonnenliege.', url: 'https://www.buesum.de/buesum-erleben/strand/strandkoerbe', indoor: false },
  { id: 'schlafstrandkorb', name: 'Eine Nacht im Schlafstrandkorb', category: 'Natur & Strand', icon: '🌙', coords: [54.1384261, 8.8383051], area: 'Büsum', description: 'Unter freiem Himmel am Strand einschlafen und mit Nordseerauschen aufwachen – das wohl besonderste Bett in Büsum.', url: 'https://www.buesum.de/buesum-erleben/strand/schlafstrandkorb', indoor: false },
  { id: 'wattfuehrung-fuer-alle', name: 'Wattführung „für Alle" (barrierearm)', category: 'Natur & Watt', icon: '👣', coords: [54.1362, 8.8352], area: 'Büsum (Perlebucht)', description: 'Kurze, barrierearme Wattführung an der Perlebucht – ideal mit kleinen Kindern oder für die erste Watt-Erfahrung.', url: 'https://www.buesum.de/veranstaltungen/event/wattwanderung-fuer-alle', indoor: false },
  { id: 'deich-radtour', name: 'Radtour auf den Deichwegen', category: 'Aktiv & Familie', icon: '🚲', coords: [54.1392, 8.8430], area: 'Büsum', description: 'Ebene, endlose Deichwege mit Schafen und Weitblick – die Fahrradgarage am Haus macht den Start leicht.', url: 'https://www.buesum.de/buesum-erleben/fuehrungen', indoor: false },
  { id: 'promenaden-bummel', name: 'Promenaden-Bummel mit Eis', category: 'Orte & Kultur', icon: '🍦', coords: [54.1329, 8.8500], area: 'Büsum', description: 'Gemütlich die Deichpromenade entlangschlendern, Schiffe gucken und mit einem Eis in der Hand den Tag treiben lassen.', url: 'https://www.buesum.de/buesum-erleben/strand', indoor: false },
  { id: 'fischbroetchen-hafen', name: 'Fischbrötchen & Krabben am Hafen', category: 'Orte & Kultur', icon: '🦐', coords: [54.1220931, 8.8588978], area: 'Büsum', description: 'Frische Nordseekrabben direkt am Fischereihafen probieren – dort, wo die Kutter sie anlanden.', url: 'https://www.buesum.de/buesum-erleben/kultur-und-sehenswertes', indoor: false },
  { id: 'sonnenuntergang-deich', name: 'Sonnenuntergang am Deich', category: 'Natur & Strand', icon: '🌅', coords: [54.1392, 8.8430], area: 'Büsum', description: 'Abends mit einer Decke auf den Deich – wenn die Sonne im Wattenmeer versinkt, ist das großes Kino und kostet nichts.', url: 'https://www.buesum.de/buesum-erleben/strand', indoor: false },
  { id: 'spa-meerzeit', name: 'Saunatag im Spa „Meerzeit"', category: 'Baden & Wellness', icon: '🧖', coords: [54.1281385, 8.8569203], area: 'Büsum', description: 'Saunawelt mit Nordseeblick im Erlebnisbad Meerzeit – Aufwärmen und Runterkommen, wenn draußen der Wind pfeift.', url: 'https://www.buesum.de/meerzeit', indoor: true },
];

const HOUSE: [number, number] = [site.geo.lat, site.geo.lng];

/** Luftlinie (Haversine) in km zwischen zwei [lat, lng]-Punkten. */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceFromHouseKm(coords: [number, number]): number {
  return haversineKm(HOUSE, coords);
}

/** "ca. 0,4 km" / "approx. 0.4 km" */
export function formatKm(km: number, lang: Lang): string {
  const num = km.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${lang === 'en' ? 'approx.' : 'ca.'} ${num} km`;
}

export const houseCoords = HOUSE;
