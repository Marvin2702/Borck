# Gäste-App „Haus Aquamarin“ — gemeinsamer Go-Live-Fahrplan

Die App liegt in `app/` (React Native + Expo, eine Codebasis für iOS und
Android). Ihr Go-live ist bewusst vom Website-Launch getrennt: Die Website kann
mit `npm run build` stabil in Produktion gehen, während App, Stores,
Web-Vorschau und Rechtstexte noch geprüft werden.

## 0. Was schon da ist

- Screens für Wohnungswahl, Wohnungs-Home, Check-in, Gästemappe, Ausflugsideen,
  Gezeiten, Notfall, Abreise, Einstellungen und Service.
- Website-Inhalte werden mit `npm run export` in `app/` exportiert; CI prüft,
  dass App-Content und Website-Quellen zusammenpassen.
- Die sieben QR-Dateien liegen unter `app/qr/` und kodieren die stabilen
  Produktionsadressen `https://www.nordsee-buesum-fewo.de/gast/{slug}/`.
- App-Icon, Splash, Bundle-ID `de.nordseebuesumfewo.gast`, EAS-Profile und die
  Expo-`projectId` sind konfiguriert. `eas init` ist nicht mehr nötig.
- Der Standard-Website-Build enthält weder die Web-App noch Links auf eine noch
  nicht freigegebene App. Der kombinierte Build ist ein expliziter zweiter
  Betriebsmodus.

## 1. Inhalte füllen und öffentliches Bundle sauber halten 👤

In `app/src/data/guestInfo.ts` alle echten, für Gäste geeigneten Inhalte prüfen
und die verbleibenden `TODO:`-Einträge ersetzen. Danach:

```bash
cd app
npm ci
npm run typecheck
npm test
STRICT_TODOS=1 npm test
```

Wichtig: Native App-Bundles und die statische Web-Vorschau sind auslesbarer
Client-Code. Deshalb niemals folgende Inhalte dort oder in öffentlichen
`PUBLIC_*`-Variablen ablegen:

- WLAN-Passwörter, Schlüsselbox-/Türcodes oder sonstige Zugangsdaten;
- Smoobu-, Expo-, Apple- oder Google-Secrets und Tokens;
- Namen, Buchungsnummern, Aufenthaltsdaten oder andere personenbezogene Daten
  konkreter Gäste.

Vor-Ort-Geheimnisse werden weiterhin über einen nicht öffentlichen Kanal bzw.
die Hinweise in der Wohnung bereitgestellt. `noindex` ist keine
Zugriffskontrolle.

## 2. Accounts und Store-Voraussetzungen 👤

1. Expo-Konto auf expo.dev anlegen bzw. den Zugriff auf das vorhandene Projekt
   klären.
2. Apple Developer Program und App Store Connect für den iOS-Release
   einrichten.
3. Google Play Console für den Android-Release einrichten. Welche Testphase vor
   einer öffentlichen Freigabe erforderlich ist, hängt vom Konto ab und muss
   anhand der aktuellen Hinweise in der Play Console geplant werden.

Gebühren und Prüfanforderungen ändern sich; maßgeblich sind die jeweils
aktuellen Angaben der Anbieter, nicht ältere Zahlen in einer Projektdatei.

## 3. Vorhandenes Expo-Projekt verifizieren

Die `projectId` steht bereits in `app/app.json`. Vom lokalen Terminal nur
prüfen, dass sie zum richtigen Expo-Konto/Projekt gehört:

```bash
cd app
npx eas-cli@latest login
npx eas-cli@latest project:info
```

Kein neues `eas init` ausführen und die ID nicht ersetzen, solange das
vorhandene Projekt korrekt ist. Ein Wechsel würde Builds und Credentials von
der bestehenden Projekthistorie trennen.

## 4. Android-Preview ohne Terminal — Klick für Klick 👤

Für die erste installierbare Android-Test-APK reicht der Browser (Dauer:
~15 Minuten plus ~20 Minuten Build-Wartezeit). Der Android-Keystore wird beim
allerersten Build automatisch in der Expo-Cloud erzeugt und dort verwaltet;
wer Credentials lieber unter persönlicher Kontrolle einrichtet, nimmt den
lokalen Weg in Abschnitt 6 — beide führen zum selben Ergebnis.

**Teil A — Expo-Token erzeugen (expo.dev):**
1. https://expo.dev öffnen und einloggen.
2. Oben rechts auf euren **Avatar → Account settings** klicken.
3. Links im Menü **Access tokens** wählen.
4. **Create token** klicken, Name z. B. `github-actions`, **Create** bestätigen.
5. Den angezeigten Token **sofort kopieren** (er wird nur einmal angezeigt) und
   nirgendwo committen; bei Verdacht auf Leck sofort widerrufen.

**Teil B — Token bei GitHub hinterlegen (github.com):**
1. https://github.com/Marvin2702/Borck öffnen.
2. **Settings** (Reiter oben im Repo) klicken.
3. Links: **Secrets and variables → Actions**.
4. **New repository secret** klicken.
5. Name: `EXPO_TOKEN` (exakt so) · Secret: den kopierten Token einfügen → **Add secret**.

**Teil C — Build starten (github.com):**
1. Im Repo auf den Reiter **Actions** klicken.
2. Links in der Workflow-Liste **„App Build (EAS)"** wählen.
3. Rechts den grauen Knopf **„Run workflow"** klicken.
4. Im Dropdown: Plattform `android`, Profil `preview` (Voreinstellung passt) → grüner **„Run workflow"**-Knopf.
5. ~15–25 Minuten warten (Seite neu laden; der Lauf wird grün ✓).

**Teil D — APK aufs Handy:**
1. Im fertigen (grünen) Lauf den Job **build** öffnen → im Log des Schritts
   **„EAS Build"** steht am Ende ein Link `https://expo.dev/accounts/…/builds/…`.
   (Alternativ: auf expo.dev → euer Projekt **„marvin" → Builds** (der Expo-Projektname; die App selbst heißt „Haus Aquamarin").)
2. Diesen Build-Link am **Android-Handy** öffnen (z. B. per WhatsApp an euch
   selbst schicken) → **Install** tippen.
3. Android fragt nach Erlaubnis für „Apps aus unbekannter Quelle" → einmalig
   für den Browser erlauben → installieren → fertig: Das Häuschen-Logo liegt
   auf dem Homescreen. 🎉
4. Denselben Link könnt ihr an weitere Android-Testgeräte schicken — für den
   ersten Praxistest völlig ausreichend, ganz ohne Play Store.

iOS-Builds und Production-Releases laufen dagegen über den kontrollierten
Weg in Abschnitt 6 (Apple-Login und Zertifikate interaktiv).

## 5. Datenschutz- und Anbieter-Gate 👤

Der Abschnitt zur App in `src/data/legal.ts` ist ein prüfpflichtiger technischer
Entwurf, keine Rechtsberatung oder Vollständigkeitsgarantie. Vor irgendeiner
öffentlichen App-/Web-App-Freigabe muss die Betreiberin bzw. Rechtsberatung den
tatsächlichen produktiven Build abnehmen. Der aktuelle technische Stand sieht
vor:

- lokale Speicherung von Wohnungswahl, An-/Abreisedaten, Aufenthalts-Bilanz,
  Erinnerungsentscheidung, Checkliste, Urlaubsplan, Erlebnis-Check-ins/
  Abzeichen, laufender Auswahlrunde und optionalem Wettercache;
- eine nur nach aktivem Opt-in und Geräteberechtigung lokal geplante einmalige
  Abreise-Benachrichtigung um 08:30 Uhr; kein eigener Push-Server;
- kein Gastkonto und kein eigenes App-Tracking;
- bei aktivierter Wetterfunktion einen direkten Abruf von
  `api.open-meteo.com` mit festen Hauskoordinaten, nicht mit Gast-Geolocation.
  Dabei sieht der Anbieter technisch mindestens die IP-Verbindung.

Open-Meteo erlaubt seine Free API laut aktuellen offiziellen
[Nutzungsbedingungen](https://open-meteo.com/en/terms) nur für
nichtkommerzielle Nutzung und nennt kommerzielle Produkte bzw. Promotion
ausdrücklich als kommerziell. Die Wetterfunktion bleibt deshalb bis zur
Klärung eines passenden kommerziellen Tarifs oder einer ausdrücklichen
Nutzungserlaubnis deaktiviert. Zusätzlich sind Anbieterrolle, Protokollierung,
Schweizer Datenübermittlung und Rechtsgrundlage zu prüfen.

Store-Datenschutzangaben werden aus diesen tatsächlichen Datenflüssen
abgeleitet. Nicht pauschal „keine Datenerhebung“ auswählen, nur weil die App
kein Konto und kein eigenes Tracking besitzt.

## 6. Ersten EAS-Build interaktiv lokal starten

Der erste iOS-Build (und wahlweise auch der Android-Build) wird aus einem
lokalen, interaktiven Terminal gestartet. `eas build` baut zwar in der
Expo-Cloud, aber Login, Projektzuordnung und Signing-Credentials werden dabei
unter persönlicher Kontrolle eingerichtet.

```bash
cd app
npm ci
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android
```

Das Preview-Profil erzeugt für Android eine intern verteilbare APK. Auf einem
echten Android-Gerät installieren und Wohnungswahl, Deep Links, Offline-Inhalte,
lokale Speicherung, externe Links sowie die Abreise-Erinnerung testen.

Für iOS nach eingerichtetem Apple-Zugang denselben Ablauf lokal starten:

```bash
npx eas-cli@latest build --profile preview --platform ios
```

Erst wenn der interaktive Erst-Build und die Credentials für die gewünschte
Plattform erfolgreich sind, auf expo.dev einen eng begrenzten Access Token
anlegen und als GitHub-Actions-Secret `EXPO_TOKEN` speichern. Danach kann der
manuelle Workflow „App Build (EAS)“ nicht-interaktive Preview-/Production-
Builds ausführen. Tokens nie in `.env.example`, Logs, Issues oder committed
Dateien kopieren und bei Verdacht sofort widerrufen.

## 7. Optionale Web-Vorschau integrieren

Die Produktionswebsite bleibt zunächst beim Standardbefehl:

```bash
npm run build
```

Erst nach Inhalts-, Datenschutz- und Funktionsabnahme wird gemeinsam gebaut:

```bash
npm run build:with-app
npm run test:e2e:with-app
```

Für Cloudflare wird der Build Command auf
`npm ci && npm run build:with-app` umgestellt. Der Kombi-Befehl setzt das
interne Freigabe-Flag nur für seinen eigenen Website-Build; das Flag nicht
zusätzlich oder unabhängig als Cloudflare-Variable pflegen, weil ein normaler
Website-Build sonst App-Links ohne App-Artefakt erzeugen könnte.

Der kombinierte Build exportiert die statischen App-Routen nach
`/gast-app/`, prüft unter anderem Wohnungs- und Guide-Routen und aktiviert die
freiwilligen App-/Web-Links unter `/gast/{slug}/`. Es gibt keinen ungefragten
Custom-Scheme-Redirect. Sämtliche Web-App-Dokumente tragen Meta-`noindex`;
Cloudflare ergänzt für `/gast/*` und `/gast-app/*` den
`X-Robots-Tag: noindex, nofollow`. Beide Bereiche fehlen in der Sitemap und
werden in `robots.txt` auch für die spezifisch genannten AI-Bots gesperrt.

Diese Maßnahmen reduzieren Suchmaschinenindexierung, machen die URLs aber
nicht privat. Keine Codes, Secrets oder personenbezogenen Inhalte in die
Web-Vorschau aufnehmen.

## 8. Store-Release 👤

1. `npm run typecheck` und `STRICT_TODOS=1 npm test` in `app/` müssen grün sein.
2. Native Preview-Builds auf echten Zielgeräten abnehmen.
3. App Store Connect/Play Console: Texte, Screenshots, Support- und
   Datenschutz-URL sowie Datenschutzformulare anhand des finalen Builds
   ausfüllen.
4. Rechtstext und Open-Meteo-/Wetterentscheidung müssen freigegeben sein.
5. Production-Build lokal interaktiv oder nach erfolgreicher
   Credential-Einrichtung über den geschützten manuellen CI-Workflow starten.
6. Im Review-Feld sachlich erklären: digitale Gästemappe für die sieben
   Ferienwohnungen, ohne Login; Check-in- und Hausinfos, lokale Ausflugsideen,
   Gezeiten-/Notfalllinks und Abreise-Checkliste.

## 9. Produktionsprüfung und QR-Codes 👤

QR-Codes erst drucken oder in den Wohnungen aushängen, wenn je Wohnung alles
Folgende geprüft ist:

- `https://www.nordsee-buesum-fewo.de/gast/{slug}/` liefert HTTP 200 und nennt
  die richtige Wohnung;
- App-/Web-Link erscheint nur im freigegebenen kombinierten Build und erst nach
  aktivem Tippen wird ein Ziel geöffnet;
- `https://www.nordsee-buesum-fewo.de/gast-app/` sowie bekannte statische
  Wohnungs-/Guide-Routen liefern HTTP 200 und `noindex`;
- installierte native App, Web-Vorschau und direkter Kontakt bieten einen
  verständlichen Fallback;
- der beworbene Store-/Testkanal ist tatsächlich erreichbar.

Die QR-Zieladressen bleiben anschließend stabil. Universal Links (AASA und
`assetlinks.json`) können später ergänzt werden; sie sind keine Voraussetzung
für die aktuelle, freiwillig angeklickte Brückenseite.

Inhalte ändern: Website-Content → `cd app && npm run export` → Änderungen
prüfen und committen; Gast-Infos direkt in `guestInfo.ts`. Sichtbar werden sie
mit dem nächsten App-/Web-App-Build.

## Store-Texte (Entwurf)

- **Name:** Haus Aquamarin
- **Untertitel:** Gäste-App für euren Büsum-Urlaub
- **Beschreibung:** Die persönliche Gäste-App vom Haus Aquamarin in Büsum —
  direkt hinter der Familienlagune Perlebucht. Check-in-Hinweise, die
  Gästemappe auch offline, Ausflugstipps, Ebbe-&-Flut-Infos, lokale
  Notfallnummern und eine Abreise-Checkliste mit optionaler lokaler Erinnerung.
  Kein Konto, keine Werbung, kein eigenes Tracking — einfach ankommen und
  Urlaub machen. Moin!
- **Keywords:** Büsum, Nordsee, Ferienwohnung, Gästemappe, Wattenmeer, Urlaub
