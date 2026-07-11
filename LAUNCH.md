# Launch-Checkliste — Umzug Staging (GitHub Pages) → www.nordsee-buesum-fewo.de

Stand: 11.07.2026. Reihenfolge einhalten; nichts davon ist auf Staging nötig.

## 1. Build/Deploy umstellen
- [ ] Prod-Deploy einrichten (eigener Workflow oder Hosting-Wechsel) mit:
  - `SITE=https://www.nordsee-buesum-fewo.de`
  - `BASE=/`
  - **`PUBLIC_STAGING` NICHT setzen** → noindex fällt automatisch weg (BaseLayout.astro L.36–37)
- [ ] `.github/workflows/deploy.yml`: Staging-Workflow hat `PUBLIC_STAGING: 'true'` hardcoded — nur für GitHub Pages lassen
- [ ] Täglichen Preis-Rebuild (cron 4:00) auch im Prod-Deploy übernehmen

## 2. Smoobu
- [ ] `SMOOBU_API_KEY` als Secret setzen (GitHub → Settings → Secrets → Actions) → ab-Preise laden automatisch
- [ ] Buchungstool-Domain-Freigabe prüfen: `www.nordsee-buesum-fewo.de` (und solange Staging läuft: `marvin2702.github.io`)
- [ ] Testbuchung durchspielen (Kalender lädt, Preise korrekt, Bestätigungsmail kommt)
- [ ] Optional: Gruppen-Buchungsseite für alle 7 Objekte → `smoobuGroupId` in `src/data/site.ts`

## 3. Google
- [ ] GA4-Property anlegen → Mess-ID in `src/data/site.ts` `googleAnalyticsId` eintragen (Consent-Banner + Conversion-Events werden damit automatisch aktiv)
- [ ] Search Console: Domain verifizieren (`googleSiteVerification` in site.ts oder DNS), Sitemap `https://www.nordsee-buesum-fewo.de/sitemap-index.xml` einreichen
- [ ] Google Business Profile: Website-URL aktualisieren; Rating-Werte in `site.ts` (`rating`) mit echtem Stand abgleichen

## 4. Redirects & DNS
- [ ] 301-Weiterleitungen von den Alt-URLs der bisherigen Smoobu-Website auf die neuen Pfade (mindestens: `/saphir` u. Ä. → `/apartments/saphir/`, `/ueber-mich` → `/ueber-uns/`)
- [ ] `robots.txt` wird dynamisch erzeugt (`src/pages/robots.txt.ts`) — nach Launch prüfen: `https://www.nordsee-buesum-fewo.de/robots.txt` zeigt die richtige Sitemap-URL

## 5. Inhalte (vor oder kurz nach Launch)
- [ ] ab-Preise: falls kein API-Key → `price_from` je Apartment im Frontmatter pflegen (`src/content/apartments/*.md`)
- [ ] Bewertungen: `date:` (JJJJ-MM-TT) und ggf. `source:` je Review ergänzen (`src/content/reviews/*.md`); `site.ts`-Rating vor Launch nochmals mit Google abgleichen
- [ ] Fotos: 6–8 Bilder je Apartment (aktuell 2–3)
- [ ] Web3Forms-Key für das Kontaktformular (kostenlos, web3forms.com) → `formAccessKey` in site.ts
- [ ] Finaler Rechtscheck AGB/Datenschutz durch Iris (Kurabgabe- und Kurzreise-Passus sind am 02.07.2026 ergänzt worden)

## 6. Nach dem Launch
- [ ] Lighthouse auf Prod-Domain neu messen (Home + Detailseite)
- [ ] Rich-Results-Test (LodgingBusiness, Apartment, BreadcrumbList, FAQ)
- [ ] Kurabgabe-Sätze jährlich prüfen (Kurabgabesatzung Gemeinde Büsum; 2026: 4,00 € HS / 2,80 € NS) — Stellen: GoodToKnow.astro, ui.ts (`apartments.kurtaxeNote`), legal.ts (AGB Punkt 4)
