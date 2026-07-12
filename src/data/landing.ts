// =========================================================================
// Themen-Landingpages (Long-Tail-SEO) — Inhalte je Sprache (DE/EN/NL/DA).
// Genutzt von den DE-Root-Seiten und den [lang]-Routen über ThemeLandingView.
// =========================================================================
import type { Lang } from '../i18n/utils';

export type LandingFilter = 'dog' | 'seaview' | 'all';

export type LandingContent = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string[];
};

export type LandingPage = {
  pageKey: string;
  filter: LandingFilter;
  content: Record<Lang, LandingContent>;
};

export const landingPages: Record<string, LandingPage> = {
  'ferienwohnung-buesum-mit-hund': {
    pageKey: 'ferienwohnung-buesum-mit-hund',
    filter: 'dog',
    content: {
      de: {
        metaTitle: 'Ferienwohnung Büsum mit Hund · Haus Aquamarin',
        metaDescription: 'Hundefreundliche Ferienwohnungen in Büsum, direkt hinter der Familienlagune. Mehrere ebenerdige Apartments mit Terrasse, Hund 46 € pro Buchung. Ohne Buchungsgebühr direkt buchen.',
        eyebrow: 'Urlaub mit Hund · Büsum',
        h1: 'Ferienwohnung in Büsum mit Hund',
        intro: [
          'Mit dem Hund an die Nordsee: Im Haus Aquamarin sind mehrere Apartments hundefreundlich. Besonders geeignet sind die ebenerdigen Wohnungen mit eigener Terrasse und separatem Eingang.',
          'Der erste Hund kostet 46 € pro Buchung, ein zweiter Hund 23 €. Bettwäsche, Handtücher und alle weiteren Optionen sind transparent ausgewiesen – du zahlst nur, was du wirklich brauchst.',
          'Direkt vor der Tür beginnen die endlosen Deichwege: ideal für ausgiebige Spaziergänge mit dem Vierbeiner, mit Schafen, Wind und Weitblick. Der Hundestrand, die Promenade und das Wattenmeer sind schnell erreicht.',
          'Für den Urlaub mit Hund empfehlen sich vor allem die Erdgeschoss-Apartments mit Terrasse: kurze Wege, kein Treppenhaus, schneller Auslauf. Die Familienlagune Perlebucht liegt nur rund 0,4 km entfernt.',
          'Du buchst direkt beim Gastgeber, ohne Vermittlungsprovision. Verfügbarkeit und Preise prüfst du tagesaktuell im Kalender des jeweiligen Apartments.',
        ],
      },
      en: {
        metaTitle: 'Holiday apartment in Büsum with dog · Haus Aquamarin',
        metaDescription: 'Dog-friendly holiday apartments in Büsum, right behind the family lagoon. Several ground-floor apartments with terrace, dog €46 per booking. Book directly, no booking fee.',
        eyebrow: 'Holiday with your dog · Büsum',
        h1: 'Holiday apartment in Büsum with dog',
        intro: [
          'Bring your dog to the North Sea: at Haus Aquamarin several apartments are dog-friendly. The ground-floor apartments with their own terrace and separate entrance are especially suitable.',
          'The first dog costs €46 per booking, a second dog €23. Bed linen, towels and all other options are shown transparently – you only pay for what you actually need.',
          'The endless dyke paths start right outside the door: ideal for long walks with your four-legged friend, with sheep, wind and wide views. The dog beach, the promenade and the Wadden Sea are quickly reached.',
          'For a holiday with a dog, the ground-floor apartments with terrace are best: short distances, no stairwell, quick access outside. The Perlebucht family lagoon is only about 0.4 km away.',
          'You book directly with the host, without commission. You can check availability and prices up to date in each apartment’s calendar.',
        ],
      },
      nl: {
        metaTitle: 'Vakantieappartement in Büsum met hond · Haus Aquamarin',
        metaDescription: 'Hondvriendelijke vakantieappartementen in Büsum, direct achter de familielagune. Meerdere gelijkvloerse appartementen met terras, hond € 46 per boeking. Direct boeken, zonder boekingskosten.',
        eyebrow: 'Vakantie met hond · Büsum',
        h1: 'Vakantieappartement in Büsum met hond',
        intro: [
          'Met de hond naar de Noordzee: in Haus Aquamarin zijn meerdere appartementen hondvriendelijk. Vooral de gelijkvloerse appartementen met eigen terras en aparte ingang zijn geschikt.',
          'De eerste hond kost € 46 per boeking, een tweede hond € 23. Beddengoed, handdoeken en alle andere opties worden transparant vermeld – je betaalt alleen wat je echt nodig hebt.',
          'Direct voor de deur beginnen de eindeloze dijkpaden: ideaal voor lange wandelingen met je viervoeter, met schapen, wind en weids uitzicht. Het hondenstrand, de promenade en de Waddenzee zijn snel bereikt.',
          'Voor een vakantie met hond zijn de benedenappartementen met terras het handigst: korte afstanden, geen trappenhuis, snel naar buiten. De familielagune Perlebucht ligt op slechts ongeveer 0,4 km.',
          'Je boekt rechtstreeks bij de gastheer, zonder bemiddelingskosten. Beschikbaarheid en prijzen bekijk je dagactueel in de kalender van het betreffende appartement.',
        ],
      },
      da: {
        metaTitle: 'Ferielejlighed i Büsum med hund · Haus Aquamarin',
        metaDescription: 'Hundevenlige ferielejligheder i Büsum, lige bag familielagunen. Flere lejligheder i stueplan med terrasse, hund 46 € pr. booking. Book direkte, uden bookinggebyr.',
        eyebrow: 'Ferie med hund · Büsum',
        h1: 'Ferielejlighed i Büsum med hund',
        intro: [
          'Tag hunden med til Nordsøen: i Haus Aquamarin er flere lejligheder hundevenlige. Særligt egnede er lejlighederne i stueplan med egen terrasse og separat indgang.',
          'Den første hund koster 46 € pr. booking, en anden hund 23 €. Sengetøj, håndklæder og alle øvrige muligheder er angivet gennemsigtigt – du betaler kun for det, du reelt har brug for.',
          'Lige uden for døren begynder de endeløse digestier: ideelle til lange gåture med den firbenede, med får, vind og vid udsigt. Hundestranden, promenaden og Vadehavet er hurtigt at nå.',
          'Til ferie med hund er stuelejlighederne med terrasse bedst: korte afstande, ingen trappeopgang, hurtigt ud. Familielagunen Perlebucht ligger kun ca. 0,4 km væk.',
          'Du booker direkte hos værten, uden formidlingsgebyr. Tilgængelighed og priser tjekker du dagsaktuelt i den enkelte lejligheds kalender.',
        ],
      },
    },
  },

  'ferienwohnung-buesum-meerblick': {
    pageKey: 'ferienwohnung-buesum-meerblick',
    filter: 'seaview',
    content: {
      de: {
        metaTitle: 'Ferienwohnung Büsum mit Meerblick · Haus Aquamarin',
        metaDescription: 'Ferienwohnung in Büsum mit Meerblick und Deichblick. Im obersten Apartment Topas siehst du die Nordsee zuerst – bis 5 Personen, Balkon, ohne Buchungsgebühr direkt buchen.',
        eyebrow: 'Meer- & Deichblick · Büsum',
        h1: 'Ferienwohnung in Büsum mit Meerblick',
        intro: [
          'Wer ganz oben wohnt, sieht das Meer zuerst: Das Apartment Topas in der zweiten Etage bietet echten Meerblick für bis zu fünf Personen.',
          'Echten Meerblick gibt es im Haus Aquamarin im obersten Apartment Topas (2. Etage, ca. 76 m², Balkon). Mehrere weitere Wohnungen punkten mit Deichblick – etwa Türkis (1. Etage) und Opal mit gleich zwei Balkonen, davon einer mit weitem Deichblick.',
          'Der Unterschied: Meerblick richtet den Blick direkt auf die Nordsee, Deichblick auf die grüne Deichkante mit ihrem typischen Nordsee-Panorama. Beides bedeutet Licht, Weite und das Gefühl, mitten in der Landschaft zu sein.',
          'Alle Apartments liegen direkt hinter der Familienlagune Perlebucht, wenige Schritte von Strand und Promenade. Morgens Kaffee auf dem Balkon, abends das Farbenspiel der untergehenden Sonne.',
          'Verfügbarkeit und Preise prüfst du direkt im Kalender des jeweiligen Apartments – ohne Buchungsgebühr, direkt beim Gastgeber.',
        ],
      },
      en: {
        metaTitle: 'Holiday apartment in Büsum with sea view · Haus Aquamarin',
        metaDescription: 'Holiday apartment in Büsum with sea and dyke view. In the top-floor Topas apartment you see the North Sea first – up to 5 people, balcony, book directly without booking fee.',
        eyebrow: 'Sea & dyke view · Büsum',
        h1: 'Holiday apartment in Büsum with sea view',
        intro: [
          'Those who live at the top see the sea first: the Topas apartment on the second floor offers a real sea view for up to five people.',
          'A genuine sea view is found at Haus Aquamarin in the top-floor Topas apartment (2nd floor, approx. 76 m², balcony). Several other apartments impress with a dyke view – such as Türkis (1st floor) and Opal with two balconies, one of them with a wide dyke view.',
          'The difference: a sea view looks straight onto the North Sea, a dyke view onto the green dyke edge with its typical North Sea panorama. Both mean light, space and the feeling of being right in the landscape.',
          'All apartments lie directly behind the Perlebucht family lagoon, a few steps from the beach and promenade. Coffee on the balcony in the morning, the play of the setting sun in the evening.',
          'You check availability and prices directly in each apartment’s calendar – no booking fee, directly with the host.',
        ],
      },
      nl: {
        metaTitle: 'Vakantieappartement in Büsum met zeezicht · Haus Aquamarin',
        metaDescription: 'Vakantieappartement in Büsum met zee- en dijkzicht. In het bovenste appartement Topas zie je de Noordzee het eerst – tot 5 personen, balkon, direct boeken zonder boekingskosten.',
        eyebrow: 'Zee- & dijkzicht · Büsum',
        h1: 'Vakantieappartement in Büsum met zeezicht',
        intro: [
          'Wie bovenin woont, ziet de zee het eerst: het appartement Topas op de tweede verdieping biedt echt zeezicht voor maximaal vijf personen.',
          'Echt zeezicht is er in Haus Aquamarin in het bovenste appartement Topas (2e verdieping, ca. 76 m², balkon). Meerdere andere appartementen scoren met dijkzicht – zoals Türkis (1e verdieping) en Opal met maar liefst twee balkons, waarvan één met weids dijkzicht.',
          'Het verschil: zeezicht richt de blik direct op de Noordzee, dijkzicht op de groene dijkrand met zijn typische Noordzee-panorama. Beide betekenen licht, ruimte en het gevoel midden in het landschap te zijn.',
          'Alle appartementen liggen direct achter de familielagune Perlebucht, op een paar passen van strand en promenade. ’s Ochtends koffie op het balkon, ’s avonds het kleurenspel van de ondergaande zon.',
          'Beschikbaarheid en prijzen bekijk je direct in de kalender van het betreffende appartement – zonder boekingskosten, rechtstreeks bij de gastheer.',
        ],
      },
      da: {
        metaTitle: 'Ferielejlighed i Büsum med havudsigt · Haus Aquamarin',
        metaDescription: 'Ferielejlighed i Büsum med hav- og digeudsigt. I den øverste lejlighed Topas ser du Nordsøen først – op til 5 personer, balkon, book direkte uden bookinggebyr.',
        eyebrow: 'Hav- & digeudsigt · Büsum',
        h1: 'Ferielejlighed i Büsum med havudsigt',
        intro: [
          'Den, der bor øverst, ser havet først: lejligheden Topas på anden sal byder på ægte havudsigt for op til fem personer.',
          'Ægte havudsigt finder du i Haus Aquamarin i den øverste lejlighed Topas (2. sal, ca. 76 m², balkon). Flere andre lejligheder byder på digeudsigt – som Türkis (1. sal) og Opal med hele to balkoner, den ene med vid digeudsigt.',
          'Forskellen: havudsigt vender blikket direkte mod Nordsøen, digeudsigt mod den grønne digekant med dens typiske Nordsø-panorama. Begge betyder lys, vidde og følelsen af at være midt i landskabet.',
          'Alle lejligheder ligger lige bag familielagunen Perlebucht, få skridt fra strand og promenade. Morgenkaffe på balkonen, om aftenen den nedgående sols farvespil.',
          'Tilgængelighed og priser tjekker du direkte i den enkelte lejligheds kalender – uden bookinggebyr, direkte hos værten.',
        ],
      },
    },
  },

  'ferienwohnung-buesum-nebensaison': {
    pageKey: 'ferienwohnung-buesum-nebensaison',
    filter: 'all',
    content: {
      de: {
        metaTitle: 'Ferienwohnung Büsum Nebensaison & Winter · Haus Aquamarin',
        metaDescription: 'Nordsee-Urlaub in der Nebensaison: ruhige Ferienwohnungen in Büsum für Herbst und Winter, ideal für längere Aufenthalte und mit Hund. Direkt buchen, ohne Buchungsgebühr.',
        eyebrow: 'Nebensaison & Winter · Büsum',
        h1: 'Ferienwohnung in Büsum für die Nebensaison',
        intro: [
          'Die Nordsee außerhalb der Hauptsaison hat ihren eigenen Reiz: leere Strände, klare Luft und Ruhe.',
          'Die Apartments im Haus Aquamarin eignen sich besonders für längere Aufenthalte in Herbst und Winter. Alle Wohnungen sind beheizt, verfügen über kostenloses WLAN und eine voll ausgestattete Küche – ideal auch für Workation und mobiles Arbeiten mit Meeresrauschen vor dem Fenster.',
          'Stürmische Spaziergänge auf dem Deich, Wattwanderungen und gemütliche Abende auf der Couch: Die Nebensaison ist die Zeit für Entschleunigung. Wer länger bleibt, erlebt Büsum von seiner ruhigsten Seite.',
          'Hunde sind herzlich willkommen – gerade in den ruhigen Monaten ein Gewinn für lange Strandspaziergänge. Bettwäsche, Handtücher und weitere Optionen sind transparent ausgewiesen.',
          'Sichere dir deinen Wunschzeitraum direkt im Buchungskalender, ohne Buchungsgebühr. Für längere Aufenthalte lohnt sich eine direkte Anfrage beim Gastgeber.',
        ],
      },
      en: {
        metaTitle: 'Holiday apartment in Büsum off-season & winter · Haus Aquamarin',
        metaDescription: 'North Sea holiday in the off-season: quiet holiday apartments in Büsum for autumn and winter, ideal for longer stays and with a dog. Book directly, no booking fee.',
        eyebrow: 'Off-season & winter · Büsum',
        h1: 'Holiday apartment in Büsum for the off-season',
        intro: [
          'The North Sea outside the high season has its own charm: empty beaches, clear air and calm.',
          'The apartments at Haus Aquamarin are especially suited to longer stays in autumn and winter. All apartments are heated, have free Wi-Fi and a fully equipped kitchen – ideal for a workation and remote work with the sound of the sea outside the window.',
          'Stormy walks on the dyke, mudflat hikes and cosy evenings on the couch: the off-season is the time to slow down. Those who stay longer experience Büsum at its quietest.',
          'Dogs are warmly welcome – a real plus for long beach walks in the quiet months. Bed linen, towels and further options are shown transparently.',
          'Secure your preferred dates directly in the booking calendar, no booking fee. For longer stays it is worth enquiring directly with the host.',
        ],
      },
      nl: {
        metaTitle: 'Vakantieappartement in Büsum laagseizoen & winter · Haus Aquamarin',
        metaDescription: 'Noordzeevakantie in het laagseizoen: rustige vakantieappartementen in Büsum voor herfst en winter, ideaal voor langere verblijven en met hond. Direct boeken, zonder boekingskosten.',
        eyebrow: 'Laagseizoen & winter · Büsum',
        h1: 'Vakantieappartement in Büsum voor het laagseizoen',
        intro: [
          'De Noordzee buiten het hoogseizoen heeft zijn eigen charme: lege stranden, heldere lucht en rust.',
          'De appartementen in Haus Aquamarin zijn bijzonder geschikt voor langere verblijven in herfst en winter. Alle appartementen zijn verwarmd, hebben gratis wifi en een volledig uitgeruste keuken – ideaal voor een workation en thuiswerken met zeegeruis voor het raam.',
          'Stormachtige wandelingen op de dijk, wadlooptochten en gezellige avonden op de bank: het laagseizoen is de tijd om te vertragen. Wie langer blijft, beleeft Büsum op zijn rustigst.',
          'Honden zijn van harte welkom – juist in de rustige maanden een pluspunt voor lange strandwandelingen. Beddengoed, handdoeken en andere opties worden transparant vermeld.',
          'Reserveer je gewenste periode direct in de boekingskalender, zonder boekingskosten. Voor langere verblijven loont een directe aanvraag bij de gastheer.',
        ],
      },
      da: {
        metaTitle: 'Ferielejlighed i Büsum lavsæson & vinter · Haus Aquamarin',
        metaDescription: 'Nordsøferie i lavsæsonen: rolige ferielejligheder i Büsum til efterår og vinter, ideelle til længere ophold og med hund. Book direkte, uden bookinggebyr.',
        eyebrow: 'Lavsæson & vinter · Büsum',
        h1: 'Ferielejlighed i Büsum til lavsæsonen',
        intro: [
          'Nordsøen uden for højsæsonen har sin helt egen charme: tomme strande, klar luft og ro.',
          'Lejlighederne i Haus Aquamarin egner sig særligt til længere ophold i efterår og vinter. Alle lejligheder er opvarmede, har gratis Wi-Fi og et fuldt udstyret køkken – ideelt til workation og hjemmearbejde med havets brusen uden for vinduet.',
          'Stormfulde gåture på diget, vadehavsture og hyggelige aftener i sofaen: lavsæsonen er tiden til at sætte tempoet ned. Den, der bliver længere, oplever Büsum fra sin mest rolige side.',
          'Hunde er hjertelig velkomne – netop i de rolige måneder en gevinst for lange strandture. Sengetøj, håndklæder og øvrige muligheder er angivet gennemsigtigt.',
          'Sikr dig din ønskede periode direkte i bookingkalenderen, uden bookinggebyr. Ved længere ophold kan det betale sig at forespørge direkte hos værten.',
        ],
      },
    },
  },
};

/** Filtert die Apartment-Liste passend zum Landingpage-Thema. */
export function filterApartments<T extends { data: { dogFriendly?: boolean; view: string; floor?: string } }>(
  all: T[],
  filter: LandingFilter,
): T[] {
  if (filter === 'dog') {
    // Die Seite empfiehlt ausdrücklich kurze Wege und Erdgeschoss-Terrassen:
    // passende Wohnungen deshalb zuerst, übrige hundefreundliche danach.
    return all
      .filter((a) => a.data.dogFriendly)
      .sort(
        (a, b) =>
          Number(!/erdgeschoss/i.test(a.data.floor ?? '')) -
          Number(!/erdgeschoss/i.test(b.data.floor ?? '')),
      );
  }
  // Meerblick ist nicht dasselbe wie Deich- oder Balkonblick. Keine unscharfe
  // Regex-Ausweitung und kein Fallback auf sachlich unpassende Apartments.
  if (filter === 'seaview') return all.filter((a) => /\bmeerblick\b/i.test(a.data.view));
  return all;
}

export const landingKeys = Object.keys(landingPages);
