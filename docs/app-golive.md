# Gäste-App „Haus Aquamarin" — gemeinsamer Go-Live-Fahrplan

Die App liegt in `app/` (React Native + Expo, eine Codebasis für iOS & Android).
Claude hat Code, Builds-Konfiguration und diese Anleitung vorbereitet — die
Schritte mit 👤 macht ihr (Accounts/Store), alles andere ist fertig.

## 0. Was schon da ist

- Alle Screens: Wohnungswahl, Wohnungs-Home, Check-in, WLAN (Kopieren),
  Gästemappe (offline), „Was machen wir heute?" (Reiseführer + Schietwetter-
  Filter), Ebbe & Flut (BSH-Link), Notfall, Abreise (Checkliste + Erinnerung +
  Google-Bewertungslink + Direktbuchung), Einstellungen.
- Website-Inhalte werden automatisch exportiert (`npm run export` in `app/`);
  CI prüft, dass App-Content und Website nicht auseinanderlaufen.
- QR-Codes je Wohnung: `app/qr/*.svg` (drucken, in die Wohnung hängen).
  Sie zeigen auf `…/gast/{wohnung}/` — die Seite existiert bereits und
  versucht die App zu öffnen. Die gedruckten Codes bleiben dauerhaft gültig.
- App-Icon/Splash aus dem Häuschen-Logo; Bundle-ID `de.nordseebuesumfewo.gast`.

## 1. Inhalte füllen (Iris, ~1 Stunde) 👤

Datei **`app/src/data/guestInfo.ts`** — alle `TODO:`-Einträge ersetzen:
WLAN je Wohnung, Schlüsselbox-Schritte, Stellplätze, Gästemappe-Details,
eure echten Tipps, lokale Notfall-Einträge, Checklisten-Punkte.
Solange TODOs offen sind, zeigt die App dort einen freundlichen Hinweis;
der Test warnt in CI. **Vor dem Store-Release:** `STRICT_TODOS=1 npm test`
muss grün sein (schlägt bei offenen TODOs fehl).

## 2. Accounts anlegen (Marvin, ~1 Tag inkl. Apple-Wartezeit) 👤

1. **Expo:** kostenloses Konto auf expo.dev → `npm i -g eas-cli` → `eas login`.
2. **Apple Developer Program** (99 €/Jahr): developer.apple.com/programs —
   Individual-Account (schnell) oder Organization (braucht D-U-N-S, Wochen!).
   Für den Start: Individual auf Iris/Marvin.
3. **Google Play Console** (25 $ einmalig): play.google.com/console.
   Hinweis: Neue Privat-Konten verlangen vor dem öffentlichen Release einen
   geschlossenen Test (≥12 Tester, 14 Tage). Für den Anfang reicht die
   APK-Verteilung per Link (Schritt 4) völlig.

## 3. Projekt verknüpfen (einmalig)

```bash
cd app
eas init          # verknüpft mit eurem Expo-Konto (trägt projectId in app.json ein)
```

## 4. Erster Test-Build (geht schon VOR dem Apple-Account: Android)

```bash
eas build --profile preview --platform android   # ergibt eine APK + Install-Link
```
Link aufs Android-Handy schicken, installieren, testen. Für iOS:
```bash
eas build --profile preview --platform ios       # braucht den Apple-Account
```
EAS fragt einmal nach dem Apple-Login und verwaltet Zertifikate automatisch.
Zum Testen auf dem iPhone: TestFlight (`eas submit -p ios --latest` lädt den
Build zu App Store Connect hoch; dort TestFlight-Tester einladen).

## 5. Store-Release

1. `STRICT_TODOS=1 npm test` → muss grün sein (keine Platzhalter beim Gast).
2. App Store Connect: Listing ausfüllen (Texte liegen unten), Screenshots
   (vom TestFlight-Gerät), Datenschutz-Angaben: „Keine Datenerhebung"
   (die App hat keine Konten, kein Tracking, speichert nur lokal).
3. Datenschutzerklärung der Website um einen App-Absatz ergänzen und als
   Privacy-URL angeben.
4. `eas build --profile production --platform all` → `eas submit`.
5. Im Review-Feld erklären: „Digitale Gästemappe für die 7 Ferienwohnungen
   des Familienbetriebs Haus Aquamarin: Self-Check-in, WLAN, Hausinfos
   offline, Gezeiten, lokale Notfallnummern. Kein Login erforderlich."

## 6. Nach dem Release

- QR-Codes drucken (`app/qr/`) und in den Wohnungen aushängen.
- Store-Badges auf der Brückenseite ergänzen (`src/pages/gast/[slug].astro`,
  TODO-Kommentar markiert die Stelle).
- Universal Links (öffnet die App direkt ohne Brückenseite): AASA-Datei +
  assetlinks.json unter `/.well-known/` der Prod-Domain — machen wir als v2
  zusammen, die gedruckten QR-Codes bleiben dieselben.
- Inhalte ändern: Website-Content → `cd app && npm run export` → committen;
  Gast-Infos → direkt in `guestInfo.ts`. Sichtbar wird beides mit dem
  nächsten Build (oder später via EAS Update/OTA, v2).

## Store-Texte (Vorschlag)

**Name:** Haus Aquamarin
**Untertitel:** Gäste-App für euren Büsum-Urlaub
**Beschreibung:** Die persönliche Gäste-App vom Haus Aquamarin in Büsum —
direkt hinter der Familienlagune Perlebucht. Self-Check-in rund um die Uhr,
WLAN-Zugang mit einem Tipp, die komplette Gästemappe auch offline, Ebbe- &
Flut-Infos, Ausflugstipps für Sonne und Schietwetter, Notfallnummern und eine
Abreise-Checkliste mit Erinnerung. Kein Konto, keine Werbung, kein Tracking —
einfach ankommen und Urlaub machen. Moin!
**Keywords:** Büsum, Nordsee, Ferienwohnung, Gästemappe, Wattenmeer, Urlaub
