# Gäste-App „Haus Aquamarin" (Expo / React Native)

Digitale Gästemappe für die 7 Ferienwohnungen — iOS & Android aus einer
Codebasis. **Go-Live-Anleitung: [`docs/app-golive.md`](../docs/app-golive.md)**

## Für Iris: Inhalte pflegen

- **Gast-Infos** (Check-in, Hausordnung, Tipps, Notfall):
  `src/data/guestInfo.ts` — alle `TODO:`-Einträge ersetzen. Keine
  Schlüsselbox-/WLAN-Codes, Secrets oder personenbezogenen Gastdaten eintragen:
  App-Bundles und Web-Vorschau sind auslesbarer Client-Code.
- **Wohnungen/Reiseführer** kommen automatisch von der Website:
  nach Website-Änderungen einmal `npm run export` ausführen und committen.
- **QR-Codes** für die Wohnungen: liegen in `qr/` (SVG). Erst drucken oder
  aushängen, wenn die jeweilige `/gast/{wohnung}/`-URL in Produktion geprüft
  mit HTTP 200 antwortet und der dort beworbene App-/Web-Kanal verfügbar ist.

## Für Entwickler

```bash
npm ci
npm run export      # Website-Content -> assets/content.json (+ Hero-Bilder)
npm start           # Expo Dev Server (Expo-Go-App aufs Handy: QR scannen)
npm run typecheck   # tsc --noEmit
npm test            # jest (führt vorher automatisch den Export aus)
npm run gen-qr      # QR-Codes je Wohnung nach qr/
```

- Deep Link: `hausaquamarin://wohnung/{slug}`; die gedruckten QRs kodieren
  `https://www.nordsee-buesum-fewo.de/gast/{slug}/` (Brückenseite der Website).
- Builds/Store: EAS (`eas.json`, Profile `preview`/`production`) — siehe
  Go-Live-Doku. CI: `.github/workflows/app-ci.yml` (Typecheck, Tests,
  Export-Frische gegen die Website-Quellen).
- Das Expo-Projekt ist bereits über `app.json` mit einer `projectId` verknüpft.
  Den ersten EAS-Build interaktiv vom lokalen Terminal starten; erst nach
  eingerichteten Credentials `EXPO_TOKEN` für nicht-interaktive CI verwenden.
- Die Website bleibt standardmäßig App-unabhängig. Nur der Root-Befehl
  `npm run build:with-app` baut die noindex-Web-Vorschau unter `/gast-app/` und
  aktiviert ihre Brückenseiten. Die Vorschau ist öffentlich erreichbar;
  `noindex` ist keine Zugriffskontrolle.
- Vor Store-Releases: `STRICT_TODOS=1 npm test` erzwingt gefüllte Gast-Infos.

Die Wetterintegration ist bis zur Anbieter-/Datenschutzfreigabe ein
prüfpflichtiges Feature. Open-Meteo erlaubt die Free API laut aktuellen
[Nutzungsbedingungen](https://open-meteo.com/en/terms) nur nichtkommerziell;
für den Vermietungsbetrieb muss vor Aktivierung ein passender Tarif bzw. eine
ausdrückliche Erlaubnis geklärt werden. Der Datenschutzentwurf der Website ist
keine Rechtsberatung oder Vollständigkeitsgarantie.
