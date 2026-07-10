# Haus Aquamarin Büsum — Website (Astro)

Relaunch von **nordsee-buesum-fewo.de**: code-basierte, mehrsprachige (DE/EN/NL/DA)
Premium-Seite mit Smoobu-Direktbuchung. Static Site (Astro) → schnell, SEO-stark,
kostengünstig zu hosten, vollständig über Claude Code / Git pflegbar.

## Schnellstart

```bash
npm install          # einmalig
npm run dev          # lokale Vorschau:  http://localhost:4321
npm run check        # Typ-/Template-Prüfung (läuft auch im CI vor jedem Deploy)
npm run build        # PRODUKTIONS-Build nach dist/ (mit Content- & Dist-Gate, s. u.)
npm run build:staging# Staging-Build (noindex; Content-Gate warnt nur)
npm run preview      # gebaute Seite lokal testen
npm test             # Staging-Build + Playwright-E2E-/Accessibility-Tests
```

**Build-Gates:** `npm run build` führt automatisch aus:
- vorher `scripts/validate-content.mjs` — bricht einen **Produktions**-Build ab,
  wenn geschäftskritische Apartment-Daten fehlen (Staging: nur Warnung).
- nachher `scripts/check-dist.mjs` — Staging: erzwingt `noindex` auf jeder Seite;
  Produktion: verbietet `noindex`, prüft Canonicals/hreflang/Sitemap gegen die
  Prod-Domain (kein GitHub-Pages-Leak).

**Tests lokal:** Playwright lädt Browser selbst (`npx playwright install chromium`).
In Container-Umgebungen mit vorinstalliertem Chromium alternativ:
`PW_CHROMIUM=/pfad/zu/chrome npm test`.

## Umgebungen & Env-Variablen

| Variable | Staging (GitHub Pages, `.github/workflows/deploy.yml`) | Produktion (nordsee-buesum-fewo.de) |
|---|---|---|
| `SITE` | wird automatisch gesetzt (`https://marvin2702.github.io`) | `https://www.nordsee-buesum-fewo.de` |
| `BASE` | wird automatisch gesetzt (`/Borck`) | `/` (bzw. weglassen) |
| `PUBLIC_STAGING` | `'true'` → alle Seiten `noindex` (schützt Prod-SEO) | **NICHT setzen** → Seiten indexierbar |
| `SMOOBU_API_KEY` | GitHub-Secret (optional) → täglicher ab-Preis-Abruf | ebenso; ohne Key bleibt `src/data/prices.json` (manuell gepflegt) |

Aktivierungs-Keys in `src/data/site.ts` (leer = Feature aus): `googleAnalyticsId`
(GA4 + Consent-Banner + Conversion-Events), `formAccessKey` (Web3Forms; ohne Key
wird das Kontaktformular sichtbar als „nicht verfügbar“ mit Direktkontakt
angezeigt), `googleProfileUrl` (Link „Alle Google-Bewertungen ansehen"),
`googleSiteVerification`, `smoobuGroupId`.

**Go-Live:** vollständige Checkliste in [LAUNCH.md](LAUNCH.md).

## Inhalte pflegen (ohne Programmierkenntnisse)

| Was ändern? | Datei |
|---|---|
| Ein Apartment (Text, Personen, Preis, Smoobu-ID) | `src/content/apartments/<name>.md` |
| Gäste-Bewertungen | `src/content/reviews/*.md` (Platzhalter ersetzen!) |
| Kontaktdaten, Adresse, Geo, Bewertungs-Aggregat | `src/data/site.ts` |
| Texte/Übersetzungen (Menü, Buttons …) | `src/i18n/ui.ts` |
| Reiseführer-Highlights (Lage-Seite) | `src/components/LocationView.astro` |
| Rechtstexte | `src/components/LegalView.astro` (Originale einsetzen) |

Eine Apartment-Datei sieht so aus — oben die Daten, unten der Beschreibungstext:

```markdown
---
name: Türkis
persons: 4
view: Deichblick
price_from: 89          # EUR/Nacht "ab"  (TODO eintragen)
smoobu_id: "123456"     # Smoobu-Objekt-ID (TODO eintragen)
heroImage: /images/tuerkis-1.jpg
---
Beschreibungstext des Apartments …
```

## Offene TODOs vor Go-Live (vom Auftraggeber)

Stand 02.07.2026 — erledigt sind bereits: Smoobu-IDs, Rechtstexte, ab-Preise
(Nebensaison-Minimum in `src/data/prices.json`), Kurtaxe/Zuschläge, hreflang/SEO.

- [ ] **Fotos**: 6–8 Bilder je Apartment (aktuell 2–3) nach `public/images/`, in `gallery` verlinken.
- [ ] **Bewertungen**: `date:`/`source:` je Review in `src/content/reviews/`; Google-Stand
      (`rating` in site.ts) abgleichen; `googleProfileUrl` eintragen.
- [ ] **GA4-Mess-ID** anlegen → `googleAnalyticsId` (schaltet Banner + Conversion-Tracking frei).
- [ ] **Web3Forms-Key** (kostenlos) → `formAccessKey`, sonst zeigt die Kontaktseite
      statt des Formulars einen „nicht verfügbar“-Hinweis mit Direktkontakt.
- [ ] **Wohnfläche (`size_qm`)** für **Rubin** und **Saphir** nachtragen — ohne sie
      bricht der Produktions-Build ab (Content-Gate).
- [ ] **SMOOBU_API_KEY** als GitHub-Secret → tagesaktuelle ab-Preise.
- [ ] **EN/NL/DA**: native Korrekturlesung der redaktionellen Texte.

## Deployment (Cloudflare Pages, empfohlen — kostenlos)

1. Repo zu GitHub/GitLab pushen.
2. Cloudflare Pages → „Connect to Git" → dieses Repo.
3. Build command: `npm run build` · Output: `dist`.
4. Custom Domain `www.nordsee-buesum-fewo.de` verbinden (DNS-Cutover).
   **Wichtig:** 301-Redirects der alten URLs setzen (SEO-Equity).

## Architektur (Kurz)

- **Astro 5**, Static Output, i18n-Routing (DE Root, EN/NL/DA mit Präfix).
- Inhalte als **Markdown Content Collections** (`src/content.config.ts`).
- **Smoobu**-Buchung via lazy-load iFrame (`src/components/BookingWidget.astro`).
- **SEO**: hreflang, `LodgingBusiness`/`Apartment`/`BreadcrumbList`/`FAQPage`-JSON-LD,
  Sitemap, OG. Bewusst **kein** Google-`VacationRental`-Rich-Result (invite-only) und
  **kein** `aggregateRating`/`review` im eigenen LodgingBusiness (Google-Bewertungen
  sind eine Drittquelle + self-serving → von Googles Review-Snippets ausgeschlossen;
  sichtbar bleiben sie natürlich).
