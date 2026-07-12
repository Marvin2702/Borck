# Haus Aquamarin Büsum — Website

Relaunch von **nordsee-buesum-fewo.de** als statische Astro-Website mit vier
Sprachen (DE/EN/NL/DA), sieben Apartment-Galerien und Smoobu-Direktbuchung.
Produktion läuft auf Cloudflare Pages; GitHub Pages bleibt ein nicht
indexierbares Staging.

## Schnellstart

Voraussetzung ist **Node.js 22.12 oder neuer** (`.nvmrc` und `package.json`).

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

`npm run build` ist absichtlich die vollständige Build-Pipeline:

1. `prebuild` lädt mit gesetztem Smoobu-Secret die aktuellen Mindestpreise.
2. Astro erzeugt die statische Website in `dist/`.
3. `postbuild` prüft Links, Canonicals, `noindex`, JSON-LD, Sitemap,
   Redirects sowie JavaScript- und Bildbudgets.

Ohne Smoobu-Secret bleibt der datierte Preis-Snapshot unverändert. Werte älter
als sieben Tage werden auf der Website nicht als aktuelle „ab“-Preise gezeigt.

## Umgebungen und Variablen

| Variable | Produktion (Cloudflare Pages) | Staging/Preview |
|---|---|---|
| `SITE` | `https://www.nordsee-buesum-fewo.de` | `https://marvin2702.github.io` bei GitHub Pages |
| `BASE` | `/` | `/Borck` bei GitHub Pages |
| `PUBLIC_STAGING` | **nicht setzen** | exakt `true` |
| `REQUIRE_INDEXABLE` | `true` als unabhängiger Produktions-Guard | nicht setzen |
| `PUBLIC_GA4_ID` | GA4-ID, z. B. `G-XXXXXXXXXX` | leer oder eigene Test-Property |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Search-Console-Token | leer |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | öffentlicher Web3Forms-Key | eigener Test-Key oder leer |
| `SMOOBU_API_KEY` | verschlüsseltes Build-Secret | GitHub-Secret optional |
| `SMOOBU_API_SECRET` | verschlüsseltes HMAC-Secret | GitHub-Secret optional |
| `REQUIRE_FRESH_PRICES` | optional `true` für einen harten Frische-Guard | nicht nötig |

Nur Variablen mit `PUBLIC_` werden in den Browser-Build übernommen. Smoobu-API-
Zugangsdaten dürfen deshalb **niemals** ein `PUBLIC_`-Präfix erhalten. Der
offizielle objektübergreifende Smoobu-Iframe nutzt direkt die öffentliche
Account-ID und benötigt keine separate Group-ID.

[.env.example](.env.example) enthält alle Variablennamen ohne echte
Zugangsdaten. Lokale Secrets nur in der von Git ignorierten `.env` oder in der
Shell setzen.

`CLOUDFLARE_DEPLOY_HOOK_URL` ist kein Cloudflare-Buildwert, sondern ein
GitHub-Actions-Secret. Der tägliche Workflow ruft damit einen privaten
Cloudflare-Pages-Deploy-Hook auf.

## Deployment

### Produktion: Cloudflare Pages

Im Cloudflare-Dashboard ein Pages-Projekt über „Connect to Git“ mit diesem
Repository verbinden:

| Einstellung | Wert |
|---|---|
| Production branch | `main` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Node-Version | aus `.nvmrc` (`22`) |

Die Produktionsvariablen und Preview-Variablen getrennt pflegen. Insbesondere
darf `PUBLIC_STAGING=true` nur in Preview/Staging gelten. Danach
`www.nordsee-buesum-fewo.de` als Custom Domain anbinden.

Cloudflare Pages liest [public/_headers](public/_headers) und
[public/_redirects](public/_redirects) beim Deployment ein. GitHub Pages
ignoriert beide Dateien; dort greifen weder die Sicherheitsheader noch echte
serverseitige 301-Antworten.

Für den täglichen Preis-Rebuild unter Cloudflare einen Deploy-Hook anlegen und
dessen URL als Repository-Secret `CLOUDFLARE_DEPLOY_HOOK_URL` speichern. Der
Workflow `.github/workflows/cloudflare-rebuild.yml` startet ihn täglich. Der
separate GitHub-Pages-Workflow baut das Staging ebenfalls täglich neu.

Der Apex-Host `nordsee-buesum-fewo.de` wird per Cloudflare Bulk Redirect oder
Redirect Rule dauerhaft (301, Pfad und Query erhalten) auf die einzige
kanonische Variante `https://www.nordsee-buesum-fewo.de` umgeleitet.
Domain-Level-Redirects werden von Pages-`_redirects` nicht unterstützt.

### Staging: GitHub Pages

`.github/workflows/deploy.yml` setzt `SITE`, `BASE=/Borck` und
`PUBLIC_STAGING=true` fest. Dadurch tragen alle Seiten ein
`noindex, nofollow`. Canonical, hreflang, Open Graph und strukturierte Daten
zeigen dennoch auf die Produktionsdomain; lokale Links sowie Staging-Sitemap
und `robots.txt` bleiben unter dem GitHub-Host und `/Borck` funktionsfähig. Diese
Werte nicht für Produktion wiederverwenden. Die drei optionalen `PUBLIC_*`-
Aktivierungswerte liest das Staging aus gleichnamigen GitHub Repository
Variables; für GA4 und Web3Forms möglichst eigene Testkonfigurationen nutzen.

## Qualitätssicherung

| Befehl/Workflow | Zweck |
|---|---|
| `npm run check` | Astro-/TypeScript-Diagnostik |
| `npm run audit:build` | Produktions-/Staging-SEO, JSON-LD, lokale Ziele, Redirects und Asset-Budgets |
| `npm run audit:lighthouse` | drei mobile Lighthouse-Läufe je Startseite, Apartmentdetail und Kontakt |
| `npm run test:e2e` | Consent, Events, Formular→Danke, Buchungswege, mobile Navigation und Screenshot-Suite |
| `npm run audit:links` | externe Links mit Timeout, Retries und begrenzter Parallelität |
| `quality.yml` | Produktions-Build plus Lighthouse bei Push und Pull Request |
| `links.yml` | wöchentliche externe Linkprüfung |
| `dependabot.yml` | monatliche npm- und GitHub-Actions-Updates |

Budgets: LCP höchstens 2,5 s, CLS höchstens 0,1, TBT höchstens 200 ms als
Lab-Proxy für INP, initiales eigenes JavaScript höchstens 100 KiB und einzelne
Bilder höchstens 600 KiB. INP selbst muss nach dem Launch mit echten Felddaten
(CrUX/Search Console) überwacht werden; ein Navigation-Lighthouse-Test erzeugt
keine belastbare INP-Messung.

Lighthouse-Berichte werden im CI 14 Tage als Artefakt gespeichert. Lokal landen
sie standardmäßig im temporären Systemverzeichnis; mit `LHCI_OUTPUT_DIR` lässt
sich ein anderer Ausgabeort setzen.

## Inhalte pflegen

| Inhalt | Datei/Ordner |
|---|---|
| Apartmentdaten, Ausstattung und Smoobu-ID | `src/content/apartments/*.md` |
| Gäste-Bewertungen | `src/content/reviews/*.md` |
| Kontaktdaten, Adresse, Geo und Bewertungsstand | `src/data/site.ts` |
| Oberflächentexte und Übersetzungen | `src/i18n/ui.ts` |
| Reiseführer | `src/content/guides/*.md` |
| Rechtstexte | `src/data/legal.ts` und `src/components/LegalView.astro` |

Die Bildvarianten liegen unter `public/images/`. Neue Originalbilder müssen vor
dem Commit in die vorhandenen AVIF/WebP/JPEG-Größen überführt werden; der
Build-Audit stoppt Einzeldateien über dem Budget.

## Architektur

- Astro 7, statischer Output und Content Collections
- DE am Root; EN/NL/DA mit Sprachpräfix
- lazy geladene Smoobu-Iframes und Karte
- responsive lokale AVIF/WebP/JPEG-Bilder
- Canonical, hreflang, Sitemap, Open Graph sowie `LodgingBusiness`, `Apartment`,
  `Article`, `BreadcrumbList` und sichtbares FAQ-Markup
- GA4/Consent Mode nur mit Deployment-Konfiguration

## Rollback

Bei einem fehlerhaften Produktionsdeploy zuerst in Cloudflare Pages unter
„Deployments“ den letzten geprüften Produktionsstand auswählen und „Rollback to
this deployment“ ausführen. Anschließend den fehlerhaften Git-Commit mit einem
normalen Revert korrigieren und neu deployen. GitHub Pages ist wegen
`noindex` und `/Borck` **kein** Produktions-Fallback.

Nach jedem Rollback Startseite, ein Apartment, Kontaktformular, Smoobu-Kalender,
`robots.txt`, Sitemap, Redirects und Response-Header erneut prüfen.

Die vollständige Go-live- und Abnahmefolge steht in [LAUNCH.md](LAUNCH.md).
