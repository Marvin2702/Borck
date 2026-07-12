# Gäste-App „Haus Aquamarin" (Expo / React Native)

Digitale Gästemappe für die 7 Ferienwohnungen — iOS & Android aus einer
Codebasis. **Go-Live-Anleitung: [`docs/app-golive.md`](../docs/app-golive.md)**

## Für Iris: Inhalte pflegen

- **Gast-Infos** (WLAN, Schlüsselbox, Hausordnung, Tipps, Notfall):
  `src/data/guestInfo.ts` — alle `TODO:`-Einträge ersetzen.
- **Wohnungen/Reiseführer** kommen automatisch von der Website:
  nach Website-Änderungen einmal `npm run export` ausführen und committen.
- **QR-Codes** für die Wohnungen: liegen fertig in `qr/` (SVG, druckbar).

## Für Entwickler

```bash
npm install
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
- Vor Store-Releases: `STRICT_TODOS=1 npm test` erzwingt gefüllte Gast-Infos.
