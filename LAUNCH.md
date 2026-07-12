# Produktionslaunch — Haus Aquamarin

Checkliste für den Umzug von GitHub-Pages-Staging auf
`https://www.nordsee-buesum-fewo.de`. Stand: 12.07.2026.

## 1. Cloudflare Pages anlegen

- [ ] Repository über „Connect to Git“ anbinden; Production Branch `main`.
- [ ] Build Command `npm ci && npm run build`, Output Directory `dist`.
- [ ] Produktionswerte setzen: `SITE=https://www.nordsee-buesum-fewo.de` und
      `BASE=/`.
- [ ] `REQUIRE_INDEXABLE=true` nur in der Produktionsumgebung setzen. Der Guard
      stoppt den Main-Deploy, falls versehentlich zugleich Staging-noindex aktiv
      ist (Cloudflare `CF_PAGES_BRANCH=main` wird zusätzlich automatisch erkannt).
- [ ] `PUBLIC_STAGING` in Produktion vollständig entfernen, nicht auf `false`
      oder einen leeren String setzen.
- [ ] Für Cloudflare-Preview-Deployments `PUBLIC_STAGING=true` setzen.
- [ ] Ersten Build prüfen: Der `postbuild`-Launch-Audit muss grün sein.

Abnahme des Build-Artefakts:

- keine indexierbare Produktionsseite enthält `noindex`; nur `/404/` und die
  vier Danke-Seiten bleiben absichtlich ausgeschlossen;
- Canonical, hreflang, `og:url`, Sitemap und strukturierte Daten verwenden nur
  `https://www.nordsee-buesum-fewo.de`;
- `_headers` und `_redirects` wurden von Cloudflare ohne Parse-Warnung erkannt;
- Startseite, Apartmentdetail und Kontakt halten die Lighthouse-Budgets ein.

## 2. Secrets und öffentliche Konfiguration

Cloudflare Pages, Produktion:

- [ ] `SMOOBU_API_KEY` als verschlüsseltes Secret hinterlegen.
- [ ] `SMOOBU_API_SECRET` als verschlüsseltes HMAC-Secret hinterlegen. Der
      Legacy-Fallback endet laut Smoobu am 25.09.2026.
- [ ] Nach erfolgreichem Preisabruf optional `REQUIRE_FRESH_PRICES=true`
      aktivieren; dann stoppt ein Build bei einem Snapshot älter als sieben
      Tage.
- [ ] `PUBLIC_GA4_ID` setzen.
- [ ] `PUBLIC_GOOGLE_SITE_VERIFICATION` setzen oder die Domain per DNS
      verifizieren.
- [ ] `PUBLIC_WEB3FORMS_ACCESS_KEY` setzen und eine eigene Testnachricht senden.
- [ ] Der offizielle All-Properties-Iframe verwendet die Smoobu-Account-ID und
      zeigt alle sieben Objekte; dafür ist keine separate Group-ID erforderlich.

GitHub, Repository Secrets:

- [ ] `SMOOBU_API_KEY` und `SMOOBU_API_SECRET` für das tägliche Staging optional
      spiegeln.
- [ ] In Cloudflare Pages unter Settings → Builds einen privaten Deploy-Hook
      erzeugen und als `CLOUDFLARE_DEPLOY_HOOK_URL` speichern.
- [ ] Workflow „Trigger Cloudflare Pages rebuild“ manuell auslösen und den neuen
      Produktionsdeploy prüfen; danach übernimmt der tägliche Cron.

Kein Smoobu-Secret darf mit `PUBLIC_` beginnen.

## 3. Domain, TLS und Weiterleitungen

- [ ] `www.nordsee-buesum-fewo.de` als Custom Domain mit gültigem TLS-Zertifikat
      anbinden.
- [ ] Apex-Domain über Cloudflare Bulk Redirect/Redirect Rule mit Status 301 auf
      `https://www.nordsee-buesum-fewo.de` umleiten; Query String und Pfad
      erhalten.
- [ ] Keine zweite indexierbare Hostvariante aktiv lassen. GitHub Pages bleibt
      Staging mit Meta-`noindex`; seine Canonicals, hreflang-, Open-Graph- und
      Schema-URLs zeigen auf die Produktionsdomain.
- [ ] Alle Alt-URLs aus Search Console, alter Sitemap, Analytics und Crawl-Export
      mit `public/_redirects` abgleichen. Die Repository-Liste deckt die sieben
      Apartment- und Buchungspfade, `/ueber-mich`, den historischen
      Sprachpfad `/en/aboutus` sowie den verwaisten Duda-Pfad `/new-page`
      jeweils mit und ohne abschließenden Slash ab.
- [ ] Jede Alt-URL einzeln mit `curl -I` oder einem Redirect-Crawler testen:
      genau eine 301-Antwort, korrektes Ziel, keine Kette und kein 404.

Wichtig: Pages-`_redirects` kann keine Domain-Level-Redirects definieren. Der
Apex-zu-www-Schritt gehört deshalb in eine Cloudflare Redirect Rule/Bulk Rule.
GitHub Pages ignoriert `_redirects` und `_headers` vollständig.

## 4. Smoobu und Anfragekanäle

- [ ] Produktionsdomain und Stagingdomain in Smoobu freigeben.
- [ ] Für jedes der sieben Apartments Kalender öffnen, Datum wählen und eine
      Testbuchung bis zur Bestätigungsseite durchführen.
- [ ] Preise, Mindestaufenthalt, Belegung, Zuschläge und Verfügbarkeit mit Smoobu
      vergleichen.
- [ ] Prüfen, dass `src/data/prices.json` nach einem Cloudflare-Build ein neues
      `updatedAt` und sieben Preiswerte besitzt.
- [ ] Web3Forms-Erfolg, Validierungsfehler und Spam-Schutz testen; es dürfen keine
      personenbezogenen Werte in Analytics-Events landen.
- [ ] Telefon- und WhatsApp-Links auf iOS und Android testen.

## 5. Analytics, Consent und Search Console

- [ ] Consent Mode v2 vor Einwilligung im Default-Zustand prüfen:
      `analytics_storage`, `ad_storage`, `ad_user_data` und
      `ad_personalization` sind `denied`.
- [ ] Einwilligen, ablehnen und später widerrufen; GA4 darf nur entsprechend dem
      gewählten Status messen.
- [ ] DebugView-Ereignisse prüfen: `view_apartment`, `select_apartment`,
      `view_booking_widget`, `iframe_engagement`, `begin_booking`,
      `generate_lead`, `contact_phone` und `contact_whatsapp`.
- [ ] `availability_search` erst abnehmen, wenn Smoobu dafür eine belastbare
      Tracking-/Cross-Domain-Integration bereitstellt; Interaktionen innerhalb
      des fremden Smoobu-Iframes sind von der Website nicht direkt beobachtbar.
- [ ] Cross-Domain-Messung zu Smoobu testen, soweit Smoobu sie unterstützt.
- [ ] Search-Console-Property verifizieren und
      `https://www.nordsee-buesum-fewo.de/sitemap-index.xml` einreichen.
- [ ] `https://www.nordsee-buesum-fewo.de/robots.txt` zeigt auf genau diese
      Sitemap und blockiert den Crawl nicht.

## 6. Technische Abnahme

- [ ] `npm ci`, `npm run check` und ein Produktions-`npm run build` sind grün.
- [ ] GitHub-Workflow „Production quality gates“ ist grün; Lighthouse-Berichte
      für Startseite, `/apartments/saphir/` und `/kontakt/` archivieren.
- [ ] Mobil: LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms, eigenes initiales JavaScript
      ≤ 100 KiB, keine kritischen Accessibility-Fehler.
- [ ] INP nach dem Launch in CrUX/Search Console beobachten; Navigation-
      Lighthouse liefert dafür nur TBT als Lab-Proxy.
- [ ] CSP, HSTS, Referrer-Policy, Permissions-Policy und
      X-Content-Type-Options auf der Produktionsantwort prüfen.
- [ ] Wöchentlichen Workflow „External link audit“ einmal manuell ausführen.
- [ ] Rich-Results-/Schema-Ausgabe zusätzlich mit Googles Testwerkzeug prüfen.

## 7. Fachliche und rechtliche Freigabe

- [ ] Betreiberin prüft AGB, Datenschutz, Impressum, Kurabgabe, Stornierung,
      Endreinigung und obligatorische Kosten.
- [ ] Bewertungsstand, Quellen und Daten mit dem Google-Profil abgleichen.
- [ ] Keine Bestpreis-, Ranking- oder Ersparnisbehauptung ohne aktuellen Nachweis.
- [ ] Google Business Profile auf die neue kanonische Domain und den korrekten
      Buchungslink umstellen.

## 8. Direkt nach dem Launch

- [ ] In den ersten 48 Stunden 404, Redirects, Formularfehler, Smoobu-Starts,
      Search-Console-Abdeckung und Core Web Vitals beobachten.
- [ ] Monatliche Dependabot-PRs für npm und GitHub Actions zeitnah prüfen und
      nach grüner CI mergen.
- [ ] Preise, Links, Bewertungen, Rechtstexte und Weiterleitungen quartalsweise
      kontrollieren.

## 9. Externe Kanäle und erste 30 Tage

- [ ] Google Business Profile: Website- und Buchungslink aktualisieren, aktuelle
      Fotos ergänzen, korrekte Angaben prüfen und jede Bewertung beantworten.
- [ ] In Smoobu eine neutrale Bewertungsbitte nach dem Aufenthalt mit direktem
      Google-Link automatisieren; kein Review-Gating und keine Gegenleistung.
- [ ] Profile bei Booking/Trivago, tourist-online, BestFewo, HRS Holidays und
      weiteren aktiven Portalen auf die neue Domain und aktuelle Daten prüfen.
- [ ] Den Büsum-/TMS-Eintrag „BUE – Aquamarin“ vervollständigen und einen Link
      zur kanonischen Website anfragen; veraltete oder tote Profile bereinigen.
- [ ] Google Vacation Rentals nur über eine offiziell unterstützte
      Smoobu-/Partneranbindung prüfen; keine eigene Feed- oder Schema-Lösung
      ohne die dafür erforderlichen Konten bauen.
- [ ] Erst nach verifizierter Conversionmessung Google Search starten:
      zunächst Marke, danach genau ein Exact-Match-Long-Tail-Test; 150–200 €
      monatlich, harte Obergrenze 250 €, negative Keywords pflegen und vorerst
      kein Performance Max.
- [ ] Nach 30 Tagen eine Baseline bilden: Sessions je Kanal, Detailaufrufe,
      Widget-Sichtkontakte, Smoobu-Einstiege, Anfragen, Telefon/WhatsApp,
      bestätigte Direktbuchungen, Umsatz, ADR und Auslastung. Umsatz und
      Buchungen aus Smoobu bleiben die Source of Truth.

## 10. Content und 90-Tage-Zyklus

- [ ] Die sechs bestehenden Reiseführer mit Iris’ Lokalwissen, eigenen Fotos,
      aktuellen Quellen und echten Aktualisierungsdaten substanziell ausbauen,
      bevor weitere Keyword-Seiten entstehen.
- [ ] Danach zuerst eigenständige Seiten zur Perlebucht sowie Weihnachten/
      Silvester erstellen; Auswahlhilfe, passende Apartments, Entfernungen,
      Verfügbarkeit, FAQ und interne Links sind Pflicht.
- [ ] Weitere Guides und Übersetzungen nach Search-Console-Nachfrage priorisieren:
      zunächst Deutsch, dann voraussichtlich Niederländisch/Englisch; Dänisch
      nur bei erkennbarem Potenzial.
- [ ] Willkommensmappe und Post-Stay-Kommunikation als sauberen
      Stammgast-Direktbuchungsweg nutzen; keine Abwerbung in Portal-Chats.
- [ ] GBP-Routine auf höchstens zwei Stunden pro Monat begrenzen und nach 90
      Tagen Seiten/Kampagnen nur anhand nachgelagerter Anfragen, Buchungen und
      Deckungsbeitrag priorisieren.

## 11. Rollback

Rollback bei einem Fehler:

1. Cloudflare Pages → Deployments → letzten grünen Produktionsdeploy auswählen →
   „Rollback to this deployment“.
2. Fehlerhaften Commit mit einem normalen Git-Revert korrigieren und neu
   deployen; keine History umschreiben.
3. Startseite, ein Apartment, Kontakt, Smoobu, `robots.txt`, Sitemap, Redirects
   und Response-Header erneut abnehmen.

GitHub Pages darf wegen `noindex` und `/Borck` niemals als indexierbarer
Produktionsersatz verwendet werden.
