# Haus Aquamarin Büsum — Website (Astro)

Relaunch von **nordsee-buesum-fewo.de**: code-basierte, mehrsprachige (DE/EN/NL/DA)
Premium-Seite mit Smoobu-Direktbuchung. Static Site (Astro) → schnell, SEO-stark,
kostengünstig zu hosten, vollständig über Claude Code / Git pflegbar.

## Schnellstart

```bash
npm install        # einmalig
npm run dev        # lokale Vorschau:  http://localhost:4321
npm run build      # Produktions-Build nach dist/
npm run preview    # gebaute Seite lokal testen
```

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

- [ ] **Smoobu-Objekt-IDs** je Apartment (`smoobu_id`) + ggf. Gruppen-ID in `site.ts`
      → schaltet die echten Buchungskalender frei.
- [ ] **Profifotos** nach `public/images/`, in den `.md`-Dateien als `heroImage`/`gallery` verlinken.
- [ ] **Preise** (`price_from`), **Wohnflächen** (`size_qm`) je Apartment.
- [ ] **Echte Google-Bewertungen** statt der Platzhalter in `src/content/reviews/`.
- [ ] **Rechtstexte** (Impressum/Datenschutz/AGB) 1:1 aus der Altseite übernehmen.
- [ ] **Adresse/Geo** exakt in `site.ts`.
- [ ] **EN/NL/DA**: UI ist übersetzt; redaktionelle Langtexte + native Korrektur ergänzen.
- [ ] **OG-Bild**: `public/images/og-default.svg` durch 1200×630-JPG ersetzen.

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
- **SEO**: hreflang, `LodgingBusiness`/`Apartment`/`Review`-JSON-LD, Sitemap, OG.
  Bewusst **kein** Google-`VacationRental`-Rich-Result (invite-only).
