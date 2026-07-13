// =========================================================================
// Inhalts-Übersetzungen (EN/NL/DA) für Erlebnisse, Moods, Badges, Service-
// Anfragen und die Abreise-Checkliste. Deutsch kommt aus den Quelldaten
// (content.json, badges.ts, services.ts, guestInfo.ts) — hier stehen nur
// die Übersetzungen; fehlt ein Eintrag, fällt die App auf Deutsch zurück
// (Tests in __tests__/i18n.test.ts wachen über Vollständigkeit).
// =========================================================================
import type { Activity, Mood } from '../content';
import type { BadgeDef } from '../data/badges';
import type { Lang } from './index';

type ActivityText = { name: string; description: string };
type XLang = Exclude<Lang, 'de'>;

export const activityI18n: Record<XLang, Record<string, ActivityText>> = {
  en: {
    'perlebucht-lagune': {
      name: 'Perlebucht Family Lagoon',
      description: 'Accessible swimming and beach lagoon at the south beach, open year-round and free, with direct North Sea views.',
    },
    'adventure-golf': {
      name: 'Family Fairway – Adventure Golf',
      description: '18 maritime-themed adventure golf holes with lighthouse, shrimp cutter and seal bank – just minutes from the house.',
    },
    'wassersport-schule': {
      name: 'Watersports Büsum – Kite, Surf & SUP School',
      description: 'VDWS-licensed school offering kitesurfing, windsurfing and SUP courses in the sheltered sports basin of the Perlebucht.',
    },
    'wattwanderung-schutzstation': {
      name: 'Mudflat Walk with the Wadden Sea Conservation Station',
      description: 'Guided mudflat walks into the UNESCO World Heritage site with trained national park guides, starting right in Büsum.',
    },
    'meerzeit-wellenbad': {
      name: 'Meerzeit – Wave Pool & Spa',
      description: 'Modern leisure pool at the south beach with saltwater wave pool, outdoor pools and sauna world – perfect for rainy days.',
    },
    'krabbenfangfahrt': {
      name: 'Shrimp Fishing Trip by Cutter',
      description: 'A roughly 1.5-hour fishing trip from the pier: haul in the net, sort the catch and experience North Sea fishing up close.',
    },
    'helgoland-ausflug': {
      name: 'Day Trip to Heligoland',
      description: 'April to October, daily aboard the “Funny Girl” from Büsum to Germany’s only offshore island – with the Düne islet and its guillemot rock.',
    },
    'museum-am-meer': {
      name: 'museum am meer & Harbour Aquarium',
      description: 'Newly opened museum on shrimp fishing and seaside-resort history, joined with the North Sea aquarium at the fishing harbour.',
    },
    'seehundsbank-fahrt': {
      name: 'Boat Trip to the Seal Bank',
      description: 'A roughly two-hour boat tour from the harbour to one of the North Sea’s largest seal banks – up to 100 animals depending on the tide.',
    },
    'phaenomania': {
      name: 'Phänomania Science Centre',
      description: 'Interactive hands-on museum with over 230 experiment stations on the senses and science (seasonal, March–October).',
    },
    'hafen-leuchtturm': {
      name: 'Büsum Harbour & Old Town with Lighthouse',
      description: 'Harbour with a large shrimp-cutter fleet, the red-and-white 1913 lighthouse and the late-Gothic St. Clemens church.',
    },
    'kartbahn-nordseering': {
      name: 'Nordseering Büsum – Go-Kart Track',
      description: 'Outdoor kart track by the dike with a 900 m circuit for adults and a 200 m children’s track.',
    },
    'kohlosseum': {
      name: 'KOHLosseum Wesselburen',
      description: 'A former sauerkraut factory housing a cabbage museum, farmers’ market and sauerkraut workshop with demonstrations and tastings.',
    },
    'kronenloch-voegel': {
      name: 'Birdwatching at Kronenloch (Speicherkoog)',
      description: 'Nature reserve with observation tower and hides where around 250 bird species can be seen over the year.',
    },
    'seehundstation-friedrichskoog': {
      name: 'Seal Centre Friedrichskoog',
      description: 'Official rescue centre for orphaned harbour and grey seals with daily feeding times – a must for families.',
    },
    'landesmuseum-meldorf': {
      name: 'Dithmarschen State Museum Meldorf',
      description: 'Newly designed permanent exhibition on some 1,200 years of Dithmarschen history – from the peasants’ republic to the 1960s.',
    },
    'strandkorb-tag': {
      name: 'Beach Chair Day at Büsum Beach',
      description: 'Enjoy wind and waves for a whole day from your own rented roofed beach chair – the North German answer to the sun lounger.',
    },
    'schlafstrandkorb': {
      name: 'A Night in a Sleeping Beach Chair',
      description: 'Fall asleep under the open sky on the beach and wake to the sound of the North Sea – probably Büsum’s most special bed.',
    },
    'wattfuehrung-fuer-alle': {
      name: 'Mudflat Tour “for Everyone” (accessible)',
      description: 'Short, accessible mudflat tour at the Perlebucht – ideal with small children or for your first mudflat experience.',
    },
    'deich-radtour': {
      name: 'Cycling on the Dike Paths',
      description: 'Flat, endless dike paths with sheep and wide views – the bike garage at the house makes starting easy.',
    },
    'promenaden-bummel': {
      name: 'Promenade Stroll with Ice Cream',
      description: 'Amble along the dike promenade, watch the ships and let the day drift by with an ice cream in hand.',
    },
    'fischbroetchen-hafen': {
      name: 'Fish Rolls & Shrimp at the Harbour',
      description: 'Taste fresh North Sea shrimp right at the fishing harbour – where the cutters land them.',
    },
    'sonnenuntergang-deich': {
      name: 'Sunset on the Dike',
      description: 'Take a blanket up the dike in the evening – when the sun sinks into the Wadden Sea, it’s pure cinema and costs nothing.',
    },
    'spa-meerzeit': {
      name: 'Sauna Day at the “Meerzeit” Spa',
      description: 'Sauna world with North Sea views at the Meerzeit leisure pool – warm up and wind down while the wind whistles outside.',
    },
  },
  nl: {
    'perlebucht-lagune': {
      name: 'Familielagune Perlebucht',
      description: 'Drempelvrije, het hele jaar vrij toegankelijke zwem- en strandlagune aan het zuidstrand met direct uitzicht op de Noordzee.',
    },
    'adventure-golf': {
      name: 'Family Fairway – Adventure Golf',
      description: '18 maritiem vormgegeven adventuregolfbanen met vuurtoren, garnalenkotter en zeehondenbank – op een paar minuten van het huis.',
    },
    'wassersport-schule': {
      name: 'Watersport Büsum – kite-, surf- & SUP-school',
      description: 'VDWS-gelicentieerde school met cursussen kitesurfen, windsurfen en suppen in het beschutte sportbekken van de Perlebucht.',
    },
    'wattwanderung-schutzstation': {
      name: 'Wadlopen met de Schutzstation Wattenmeer',
      description: 'Begeleide wadlooptochten het UNESCO-werelderfgoed in, met opgeleide nationaalparkgidsen, direct vanuit Büsum.',
    },
    'meerzeit-wellenbad': {
      name: 'Meerzeit – golfslagbad & spa',
      description: 'Modern belevenisbad aan het zuidstrand met zoutwater-golfslagbad, buitenbaden en saunawereld – perfect bij slecht weer.',
    },
    'krabbenfangfahrt': {
      name: 'Garnalenvangsttocht met de kotter',
      description: 'Ongeveer 1,5 uur durende vangsttocht vanaf de visserskade: net binnenhalen, vangst sorteren en de Noordzeevisserij van dichtbij beleven.',
    },
    'helgoland-ausflug': {
      name: 'Dagtocht naar Helgoland',
      description: 'Van april tot oktober dagelijks met de „Funny Girl” vanuit Büsum naar Duitslands enige eiland in open zee – met duin en zeekoetenrots.',
    },
    'museum-am-meer': {
      name: 'museum am meer & aquarium aan de haven',
      description: 'Nieuw geopend museum over de garnalenvisserij en de badplaatsgeschiedenis, verbonden met het Noordzee-aquarium aan de vissershaven.',
    },
    'seehundsbank-fahrt': {
      name: 'Vaartocht naar de zeehondenbank',
      description: 'Ongeveer twee uur durende boottocht vanaf de haven naar een van de grootste zeehondenbanken van de Noordzee – afhankelijk van het getij tot 100 dieren.',
    },
    'phaenomania': {
      name: 'Phänomania belevingscentrum',
      description: 'Interactief doe-museum met ruim 230 experimenteerstations over zintuigen en natuurwetenschap (seizoensgebonden, maart–oktober).',
    },
    'hafen-leuchtturm': {
      name: 'Haven van Büsum & oude centrum met vuurtoren',
      description: 'Haven met een grote garnalenkottervloot, de rood-witte vuurtoren uit 1913 en de laatgotische St.-Clemenskerk.',
    },
    'kartbahn-nordseering': {
      name: 'Nordseering Büsum – kartbaan',
      description: 'Outdoor-kartbaan aan de dijk met een baan van 900 m voor volwassenen en een kinderbaan van 200 m.',
    },
    'kohlosseum': {
      name: 'KOHLosseum Wesselburen',
      description: 'In een voormalige zuurkoolfabriek verenigd: koolmuseum, boerenmarkt en zuurkoolwerkplaats met demonstraties en proeverij.',
    },
    'kronenloch-voegel': {
      name: 'Vogels kijken bij Kronenloch (Speicherkoog)',
      description: 'Natuurgebied met observatietoren en kijkhutten waar in de loop van het jaar zo’n 250 vogelsoorten te zien zijn.',
    },
    'seehundstation-friedrichskoog': {
      name: 'Zeehondenopvang Friedrichskoog',
      description: 'Officiële opvang voor verweesde gewone en grijze zeehonden met dagelijkse voedermomenten – een must voor gezinnen.',
    },
    'landesmuseum-meldorf': {
      name: 'Dithmarscher Landesmuseum Meldorf',
      description: 'Nieuw ingerichte vaste tentoonstelling over zo’n 1200 jaar geschiedenis van Dithmarschen – van boerenrepubliek tot de jaren 60.',
    },
    'strandkorb-tag': {
      name: 'Strandkorfdag aan het strand van Büsum',
      description: 'Een hele dag genieten van wind en golven vanuit je eigen gehuurde strandkorf – het Noord-Duitse antwoord op de ligstoel.',
    },
    'schlafstrandkorb': {
      name: 'Een nacht in de slaapstrandkorf',
      description: 'Onder de blote hemel op het strand in slaap vallen en wakker worden met het ruisen van de Noordzee – hét bijzonderste bed van Büsum.',
    },
    'wattfuehrung-fuer-alle': {
      name: 'Wadexcursie „voor iedereen” (goed toegankelijk)',
      description: 'Korte, goed toegankelijke wadexcursie bij de Perlebucht – ideaal met kleine kinderen of voor je eerste wad-ervaring.',
    },
    'deich-radtour': {
      name: 'Fietstocht over de dijkpaden',
      description: 'Vlakke, eindeloze dijkpaden met schapen en weids uitzicht – de fietsenstalling bij het huis maakt starten makkelijk.',
    },
    'promenaden-bummel': {
      name: 'Promenadewandeling met ijsje',
      description: 'Gezellig over de dijkpromenade slenteren, schepen kijken en met een ijsje in de hand de dag laten verglijden.',
    },
    'fischbroetchen-hafen': {
      name: 'Visbroodjes & garnalen aan de haven',
      description: 'Verse Noordzeegarnalen proeven direct aan de vissershaven – daar waar de kotters ze aanlanden.',
    },
    'sonnenuntergang-deich': {
      name: 'Zonsondergang op de dijk',
      description: '’s Avonds met een deken de dijk op – als de zon in de Waddenzee zakt, is dat een groots schouwspel en het kost niets.',
    },
    'spa-meerzeit': {
      name: 'Saunadag in spa „Meerzeit”',
      description: 'Saunawereld met uitzicht op de Noordzee in belevenisbad Meerzeit – opwarmen en tot rust komen als buiten de wind fluit.',
    },
  },
  da: {
    'perlebucht-lagune': {
      name: 'Familielagunen Perlebucht',
      description: 'Handicapvenlig bade- og strandlagune ved sydstranden, gratis og åben hele året, med direkte udsigt over Nordsøen.',
    },
    'adventure-golf': {
      name: 'Family Fairway – Adventure Golf',
      description: '18 maritimt udformede adventuregolf-baner med fyrtårn, rejekutter og sælbanke – kun få minutter fra huset.',
    },
    'wassersport-schule': {
      name: 'Vandsport Büsum – kite-, surf- & SUP-skole',
      description: 'VDWS-licenseret skole med kurser i kitesurfing, windsurfing og SUP i Perlebuchts beskyttede sportsbassin.',
    },
    'wattwanderung-schutzstation': {
      name: 'Vadehavsvandring med Schutzstation Wattenmeer',
      description: 'Guidede vadehavsvandringer ind i UNESCO-verdensarven med uddannede nationalparkguider, direkte fra Büsum.',
    },
    'meerzeit-wellenbad': {
      name: 'Meerzeit – bølgebad & spa',
      description: 'Moderne badeland ved sydstranden med saltvands-bølgebassin, udendørsbassiner og saunaverden – perfekt i skidtvejr.',
    },
    'krabbenfangfahrt': {
      name: 'Rejefangsttur med kutter',
      description: 'Cirka 1,5 times fangsttur fra fiskerkajen: hal nettet ind, sortér fangsten og oplev nordsøfiskeriet helt tæt på.',
    },
    'helgoland-ausflug': {
      name: 'Dagstur til Helgoland',
      description: 'Fra april til oktober dagligt med „Funny Girl” fra Büsum til Tysklands eneste ø på åbent hav – med klit og lomvieklippe.',
    },
    'museum-am-meer': {
      name: 'museum am meer & akvarium ved havnen',
      description: 'Nyåbnet museum om rejefiskeri og badebyens historie, forbundet med Nordsø-akvariet ved fiskerihavnen.',
    },
    'seehundsbank-fahrt': {
      name: 'Sejltur til sælbanken',
      description: 'Cirka to timers sejltur fra havnen til en af Nordsøens største sælbanker – op til 100 dyr afhængigt af tidevandet.',
    },
    'phaenomania': {
      name: 'Phänomania oplevelsescenter',
      description: 'Interaktivt prøv-selv-museum med over 230 eksperimentstationer om sanser og naturvidenskab (sæson: marts–oktober).',
    },
    'hafen-leuchtturm': {
      name: 'Büsum havn & den gamle bydel med fyrtårn',
      description: 'Havn med stor rejekutterflåde, det rød-hvide fyrtårn fra 1913 og den sengotiske St. Clemens-kirke.',
    },
    'kartbahn-nordseering': {
      name: 'Nordseering Büsum – gokartbane',
      description: 'Udendørs gokartbane ved diget med en 900 m bane til voksne og en 200 m børnebane.',
    },
    'kohlosseum': {
      name: 'KOHLosseum Wesselburen',
      description: 'Samlet i en tidligere surkålsfabrik: kålmuseum, bondemarked og surkålsværksted med demonstrationer og smagsprøver.',
    },
    'kronenloch-voegel': {
      name: 'Fuglekiggeri ved Kronenloch (Speicherkoog)',
      description: 'Naturreservat med udsigtstårn og skjul, hvor man i løbet af året kan se omkring 250 fuglearter.',
    },
    'seehundstation-friedrichskoog': {
      name: 'Sælstationen Friedrichskoog',
      description: 'Officiel plejestation for forældreløse spættede sæler og gråsæler med daglige fodringer – et must for familier.',
    },
    'landesmuseum-meldorf': {
      name: 'Dithmarschens landsmuseum Meldorf',
      description: 'Nyindrettet fast udstilling om cirka 1.200 års Dithmarschen-historie – fra bonderepublikken til 1960’erne.',
    },
    'strandkorb-tag': {
      name: 'Strandkurv-dag på Büsum strand',
      description: 'Nyd vind og bølger en hel dag fra din egen lejede strandkurv – det nordtyske svar på solsengen.',
    },
    'schlafstrandkorb': {
      name: 'En nat i sovestrandkurven',
      description: 'Fald i søvn under åben himmel på stranden og vågn til Nordsøens brusen – nok den mest specielle seng i Büsum.',
    },
    'wattfuehrung-fuer-alle': {
      name: 'Vadehavstur „for alle” (handicapvenlig)',
      description: 'Kort, handicapvenlig vadehavstur ved Perlebucht – ideel med små børn eller til den første oplevelse i vadehavet.',
    },
    'deich-radtour': {
      name: 'Cykeltur på digestierne',
      description: 'Flade, endeløse digestier med får og vid udsigt – cykelgaragen ved huset gør starten nem.',
    },
    'promenaden-bummel': {
      name: 'Promenadetur med is',
      description: 'Slentr hyggeligt langs digepromenaden, kig på skibe og lad dagen glide forbi med en is i hånden.',
    },
    'fischbroetchen-hafen': {
      name: 'Fischbrötchen & rejer ved havnen',
      description: 'Smag friske nordsørejer direkte ved fiskerihavnen – dér hvor kutterne lander dem.',
    },
    'sonnenuntergang-deich': {
      name: 'Solnedgang på diget',
      description: 'Tag et tæppe med op på diget om aftenen – når solen synker i Vadehavet, er det bedre end biografen – og det koster ingenting.',
    },
    'spa-meerzeit': {
      name: 'Saunadag i spa „Meerzeit”',
      description: 'Saunaverden med udsigt over Nordsøen i badelandet Meerzeit – varm op og find roen, mens vinden pifter udenfor.',
    },
  },
};

type MoodText = { label: string; teaser: string };

export const moodI18n: Record<XLang, Record<string, MoodText>> = {
  en: {
    wasser: { label: 'Out on the Water', teaser: 'Cutters, Heligoland, seals & waves' },
    watt: { label: 'Mudflats & Nature', teaser: 'World Heritage, birds and wide horizons' },
    action: { label: 'Action & Family', teaser: 'Golf, karts, experiments, feeding seals' },
    kultur: { label: 'Culture & Strolling', teaser: 'Museums, harbour, old town and treats' },
    wellness: { label: 'Wellness & Bathing', teaser: 'Wave pool, sauna and warming up' },
    strand: { label: 'Beach Day', teaser: 'Beach chair, lagoon, sunset' },
  },
  nl: {
    wasser: { label: 'Het water op', teaser: 'Kotters, Helgoland, zeehonden & golven' },
    watt: { label: 'Wad & natuur', teaser: 'Werelderfgoed, vogels en een weidse horizon' },
    action: { label: 'Actie & familie', teaser: 'Golf, karts, experimenten, zeehonden voeren' },
    kultur: { label: 'Cultuur & slenteren', teaser: 'Musea, haven, oude centrum en lekkers' },
    wellness: { label: 'Wellness & baden', teaser: 'Golfslagbad, sauna en opwarmen' },
    strand: { label: 'Stranddag', teaser: 'Strandkorf, lagune, zonsondergang' },
  },
  da: {
    wasser: { label: 'Ud på vandet', teaser: 'Kuttere, Helgoland, sæler & bølger' },
    watt: { label: 'Vadehav & natur', teaser: 'Verdensarv, fugle og vid horisont' },
    action: { label: 'Action & familie', teaser: 'Golf, gokart, eksperimenter, sælfodring' },
    kultur: { label: 'Kultur & slentretur', teaser: 'Museer, havn, gammel bydel og lækkerier' },
    wellness: { label: 'Wellness & badning', teaser: 'Bølgebad, sauna og varme' },
    strand: { label: 'Stranddag', teaser: 'Strandkurv, lagune, solnedgang' },
  },
};

type BadgeText = { title: string; hint: string };

export const badgeI18n: Record<XLang, Record<string, BadgeText>> = {
  en: {
    moin: { title: 'Moin!', hint: 'Your first activity ticked off' },
    wattlaeufer: { title: 'Mudflat Walker', hint: 'Once into the Wadden Sea World Heritage site' },
    'seehund-spotter': { title: 'Seal Spotter', hint: 'Seen seals for real' },
    'leuchtturm-fan': { title: 'Lighthouse Fan', hint: 'Visited harbour & lighthouse' },
    wellenreiter: { title: 'Wave Rider', hint: 'Swimming, waves or board — just get wet' },
    'schietwetter-held': { title: 'Foul-Weather Hero', hint: 'Headed out in true North Sea weather' },
    landratte: { title: 'Explorer Landlubber', hint: 'A trip further than 10 km' },
    'buesum-profi': { title: 'Büsum Pro', hint: 'Five activities ticked off' },
    'iris-best': { title: 'Iris’ Best', hint: 'Experienced three of the host’s favourite tips' },
  },
  nl: {
    moin: { title: 'Moin!', hint: 'Jullie eerste activiteit afgevinkt' },
    wattlaeufer: { title: 'Wadloper', hint: 'Eén keer het werelderfgoed wad op' },
    'seehund-spotter': { title: 'Zeehond-spotter', hint: 'Zeehonden in het echt gezien' },
    'leuchtturm-fan': { title: 'Vuurtorenfan', hint: 'Haven & vuurtoren bezocht' },
    wellenreiter: { title: 'Golfrijder', hint: 'Zwemmen, golven of plank — als je maar nat wordt' },
    'schietwetter-held': { title: 'Hondenweer-held', hint: 'Bij echt hondenweer eropuit' },
    landratte: { title: 'Ontdekker-landrot', hint: 'Een uitstapje verder dan 10 km' },
    'buesum-profi': { title: 'Büsum-pro', hint: 'Vijf activiteiten afgevinkt' },
    'iris-best': { title: 'Iris’ Best', hint: 'Drie lievelingstips van de gastvrouw beleefd' },
  },
  da: {
    moin: { title: 'Moin!', hint: 'Jeres første aktivitet afkrydset' },
    wattlaeufer: { title: 'Vadehavsvandrer', hint: 'Én gang ud i verdensarven Vadehavet' },
    'seehund-spotter': { title: 'Sæl-spotter', hint: 'Set sæler i virkeligheden' },
    'leuchtturm-fan': { title: 'Fyrtårnsfan', hint: 'Besøgt havn & fyrtårn' },
    wellenreiter: { title: 'Bølgerytter', hint: 'Badning, bølger eller bræt — bare du bliver våd' },
    'schietwetter-held': { title: 'Skidtvejrs-helt', hint: 'Ud i ægte nordsøvejr' },
    landratte: { title: 'Opdager-landkrabbe', hint: 'En udflugt længere end 10 km' },
    'buesum-profi': { title: 'Büsum-prof', hint: 'Fem aktiviteter afkrydset' },
    'iris-best': { title: 'Iris’ Best', hint: 'Oplevet tre af værtindens yndlingstips' },
  },
};

type ServiceText = { label: string; hint: string };

export const serviceI18n: Record<XLang, Record<string, ServiceText>> = {
  en: {
    'late-checkout': { label: 'Ask for late check-out', hint: 'Sleep in — Iris will check what’s possible' },
    waesche: { label: 'Fresh towels / bed linen', hint: 'Fresh supplies for a fee (see the guest manual)' },
    broetchen: { label: 'Bread roll question', hint: 'Where to get breakfast rolls nearby' },
    problem: { label: 'Report a problem', hint: 'Something broken or not working?' },
    nochmal: { label: 'Book again', hint: 'Ask about your favourite dates directly' },
  },
  nl: {
    'late-checkout': { label: 'Late check-out aanvragen', hint: 'Uitslapen — Iris kijkt wat er mogelijk is' },
    waesche: { label: 'Verse handdoeken / beddengoed', hint: 'Aanvulling tegen vergoeding (zie gastenmap)' },
    broetchen: { label: 'Broodjesvraag', hint: 'Waar haal je ’s ochtends verse broodjes?' },
    problem: { label: 'Probleem melden', hint: 'Iets kapot of werkt iets niet?' },
    nochmal: { label: 'Nog eens boeken', hint: 'Vraag direct naar jullie favoriete data' },
  },
  da: {
    'late-checkout': { label: 'Spørg om sen check-out', hint: 'Sov længe — Iris ser, hvad der kan lade sig gøre' },
    waesche: { label: 'Friske håndklæder / sengetøj', hint: 'Suppleres mod gebyr (se gæstemappen)' },
    broetchen: { label: 'Rundstykke-spørgsmål', hint: 'Hvor du finder friske morgenbrød i nærheden' },
    problem: { label: 'Meld et problem', hint: 'Er noget i stykker, eller virker noget ikke?' },
    nochmal: { label: 'Book igen', hint: 'Spørg direkte efter jeres ønskedatoer' },
  },
};

/** Abreise-Checkliste: Übersetzung der Standard-Einträge (Schlüssel = deutscher Text). */
export const checklistI18n: Record<XLang, Record<string, string>> = {
  en: {
    'Geschirr gespült und eingeräumt': 'Dishes washed and put away',
    'Müll in die Tonnen gebracht': 'Rubbish taken to the bins',
    'Fenster geschlossen, Heizung runtergedreht': 'Windows closed, heating turned down',
    'Kühlschrank geleert': 'Fridge emptied',
    'Alle Schlüssel zurück (inkl. Fahrradgarage)': 'All keys returned (incl. bike garage)',
  },
  nl: {
    'Geschirr gespült und eingeräumt': 'Afwas gedaan en opgeruimd',
    'Müll in die Tonnen gebracht': 'Afval naar de containers gebracht',
    'Fenster geschlossen, Heizung runtergedreht': 'Ramen dicht, verwarming laag gezet',
    'Kühlschrank geleert': 'Koelkast leeggemaakt',
    'Alle Schlüssel zurück (inkl. Fahrradgarage)': 'Alle sleutels terug (incl. fietsenstalling)',
  },
  da: {
    'Geschirr gespült und eingeräumt': 'Opvasken klaret og sat på plads',
    'Müll in die Tonnen gebracht': 'Affald bragt til containerne',
    'Fenster geschlossen, Heizung runtergedreht': 'Vinduer lukket, varmen skruet ned',
    'Kühlschrank geleert': 'Køleskab tømt',
    'Alle Schlüssel zurück (inkl. Fahrradgarage)': 'Alle nøgler afleveret (inkl. cykelgarage)',
  },
};

/** Notfall-Titel: Übersetzung der bundesweiten Standard-Einträge (Schlüssel = Telefonnummer). */
export const emergencyI18n: Record<XLang, Record<string, string>> = {
  en: {
    '112': 'Emergency (fire/ambulance)',
    '110': 'Police',
    '116117': 'Out-of-hours medical service',
    '055119240': 'Poison control (North)',
  },
  nl: {
    '112': 'Noodnummer (brandweer/ambulance)',
    '110': 'Politie',
    '116117': 'Huisartsenpost (dienstdoend)',
    '055119240': 'Gifcentrale (Noord)',
  },
  da: {
    '112': 'Alarm (brand/ambulance)',
    '110': 'Politi',
    '116117': 'Lægevagt',
    '055119240': 'Giftlinjen (Nord)',
  },
};

// --- Zugriffs-Helfer (Fallback: Deutsch aus den Quelldaten) -----------------

export function activityText(a: Activity, lang: Lang): ActivityText {
  if (lang === 'de') return { name: a.name, description: a.description };
  return activityI18n[lang][a.id] ?? { name: a.name, description: a.description };
}

export function moodText(m: Mood, lang: Lang): MoodText {
  if (lang === 'de') return { label: m.label, teaser: m.teaser };
  return moodI18n[lang][m.id] ?? { label: m.label, teaser: m.teaser };
}

export function badgeText(def: BadgeDef, lang: Lang): BadgeText {
  if (lang === 'de') return { title: def.title, hint: def.hint };
  return badgeI18n[lang][def.id] ?? { title: def.title, hint: def.hint };
}

export function serviceText(id: string, fallback: ServiceText, lang: Lang): ServiceText {
  if (lang === 'de') return fallback;
  return serviceI18n[lang][id] ?? fallback;
}

export function checklistText(item: string, lang: Lang): string {
  if (lang === 'de') return item;
  return checklistI18n[lang][item] ?? item;
}

export function emergencyTitle(tel: string | undefined, fallback: string, lang: Lang): string {
  if (lang === 'de' || !tel) return fallback;
  return emergencyI18n[lang][tel] ?? fallback;
}
