// =========================================================================
// E2E-Kernchecks: Sprachversionen, SEO-Meta, mobile Navigation, Consent,
// Buchungswidget-Ladeverhalten, Kontaktformular, interne Links.
// Läuft gegen den Staging-Build (noindex aktiv, Prod-Domain in Canonicals).
// =========================================================================
import { test, expect } from '@playwright/test';

const LANG_HOMES = [
  { path: '/', lang: 'de' },
  { path: '/en/', lang: 'en' },
  { path: '/nl/', lang: 'nl' },
  { path: '/da/', lang: 'da' },
];
const APARTMENTS = ['tuerkis', 'saphir', 'bernstein', 'topas', 'rubin', 'opal', 'smaragd'];
const ORIGIN = 'https://www.nordsee-buesum-fewo.de';

test.describe('Sprachversionen & SEO-Metadaten', () => {
  for (const { path, lang } of LANG_HOMES) {
    test(`Startseite ${lang} lädt mit Status 200, lang-Attribut und genau einem H1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('Canonical vorhanden und zeigt auf die Produktions-Domain', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', `${ORIGIN}/`);
  });

  test('hreflang-Gruppe enthält alle Sprachen + x-default', async ({ page }) => {
    await page.goto('/');
    for (const code of ['de', 'en', 'nl', 'da', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${code}"]`)).toHaveCount(1);
    }
  });

  test('Staging-Build trägt noindex (Prod-Check läuft in scripts/check-dist.mjs)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('LodgingBusiness-JSON-LD ohne aggregateRating/review (Google-Policy)', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const lodging = blocks.map((b) => JSON.parse(b)).find((o) => o['@type'] === 'LodgingBusiness');
    expect(lodging).toBeTruthy();
    expect(lodging.aggregateRating).toBeUndefined();
    expect(lodging.review).toBeUndefined();
  });
});

test.describe('Navigation', () => {
  test('Desktop-Navigation: Link führt zur Apartment-Übersicht', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav .nav-link', { hasText: 'Apartments' }).click();
    await expect(page).toHaveURL(/\/apartments\/$/);
    await expect(page.locator('h1')).toContainText('Apartments');
  });

  test.describe('Mobil', () => {
    test.use({ viewport: { width: 400, height: 800 } });

    test('Menü öffnet und schließt, aria-expanded wird aktualisiert', async ({ page }) => {
      await page.goto('/');
      const burger = page.locator('[data-navtoggle]');
      const nav = page.locator('#site-nav');
      await expect(burger).toHaveAttribute('aria-expanded', 'false');
      await expect(nav).toBeHidden();
      await burger.click();
      await expect(burger).toHaveAttribute('aria-expanded', 'true');
      await expect(nav).toBeVisible();
      await burger.click();
      await expect(burger).toHaveAttribute('aria-expanded', 'false');
      await expect(nav).toBeHidden();
    });

    test('Escape schließt das Menü und gibt den Fokus an den Button zurück', async ({ page }) => {
      await page.goto('/');
      const burger = page.locator('[data-navtoggle]');
      await burger.click();
      await expect(page.locator('#site-nav')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#site-nav')).toBeHidden();
      await expect(burger).toHaveAttribute('aria-expanded', 'false');
      await expect(burger).toBeFocused();
    });

    test('Geschlossenes Menü: Links sind nicht per Tab erreichbar', async ({ page }) => {
      await page.goto('/');
      const firstNavLink = page.locator('#site-nav .nav-link').first();
      await expect(firstNavLink).toBeHidden();
      // Durch alle fokussierbaren Elemente tabben: kein Fokus darf im Menü landen.
      let inNav = false;
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        inNav = await page.evaluate(() => !!document.activeElement?.closest('#site-nav'));
        if (inNav) break;
      }
      expect(inNav).toBe(false);
    });
  });
});

test.describe('Consent & Analytics', () => {
  test('Ohne Einwilligung wird kein Google Analytics geladen', async ({ page }) => {
    const gaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com') || req.url().includes('google-analytics.com')) {
        gaRequests.push(req.url());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(1500);
    expect(gaRequests).toEqual([]);
  });

  test('Cookie-Banner-Link zeigt auf die (deutsche) Datenschutzerklärung', async ({ page }) => {
    // Rechtstexte existieren bewusst nur auf Deutsch (Footer-Hinweis) — der
    // Banner-Link muss in jeder Sprache auf eine existierende Seite zeigen.
    for (const { path } of LANG_HOMES) {
      await page.goto(path);
      const href = await page.locator('[data-consent] a').getAttribute('href');
      expect(href).toBe('/datenschutz/');
      const res = await page.request.get(href!);
      expect(res.status()).toBe(200);
    }
  });
});

test.describe('Buchungswidget (Smoobu)', () => {
  // Flacher Viewport: der Buchungsbereich liegt damit klar unterhalb der
  // IntersectionObserver-Vorladezone (200px) — deterministischer Test.
  test.use({ viewport: { width: 1280, height: 500 } });

  test('Third-Party-Code lädt nicht beim Seitenaufbau, sondern erst bei Annäherung', async ({ page }) => {
    const smoobu: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('smoobu.com')) smoobu.push(req.url());
    });
    await page.goto('/apartments/tuerkis/');
    await page.waitForTimeout(1200);
    expect(smoobu).toEqual([]);
    // Erst beim Scrollen zum Buchungsbereich wird Smoobu angefordert.
    await page.locator('#buchung').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    expect(smoobu.length).toBeGreaterThan(0);
  });

  test('Aktivieren-Button lädt das Widget per Klick (Fallback ohne Scroll-Trigger)', async ({ page }) => {
    const smoobu: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('smoobu.com')) smoobu.push(req.url());
    });
    await page.goto('/apartments/rubin/');
    const btn = page.locator('[data-booking-activate]');
    // Button existiert im Ausgangszustand (bevor der Observer feuert).
    await expect(btn).toBeAttached();
    await btn.evaluate((el) => (el as HTMLElement).click()); // ohne Scroll klicken
    await page.waitForTimeout(1000);
    expect(smoobu.length).toBeGreaterThan(0);
  });
});

test.describe('Kontaktformular', () => {
  test('Ohne konfigurierten Form-Endpunkt: klar als nicht verfügbar, kein Pseudo-Formular', async ({ page }) => {
    // Solange site.formAccessKey leer ist, darf kein scheinbar funktionierendes
    // Formular erscheinen — stattdessen Hinweis + Direktkontakt.
    await page.goto('/kontakt/');
    const hasKey = (await page.locator('form[data-contact-form]').count()) > 0;
    if (hasKey) {
      // Sobald ein Key konfiguriert ist: Formular mit nativen Datumsfeldern.
      await expect(page.locator('input[name="anreise"]')).toHaveAttribute('type', 'date');
      await expect(page.locator('input[name="abreise"]')).toHaveAttribute('type', 'date');
    } else {
      await expect(page.locator('.contact-unavailable')).toBeVisible();
      await expect(page.locator('.contact-unavailable a[href^="mailto:"]')).toBeVisible();
    }
  });
});

test.describe('Erreichbarkeit aller Seiten & interne Links', () => {
  test('Alle Apartmentseiten liefern 200 (alle Sprachen)', async ({ request }) => {
    for (const prefix of ['', '/en', '/nl', '/da']) {
      for (const slug of APARTMENTS) {
        const res = await request.get(`${prefix}/apartments/${slug}/`);
        expect(res.status(), `${prefix}/apartments/${slug}/`).toBe(200);
      }
    }
  });

  test('Keine kaputten internen Links auf Start-, Übersichts- und Lage-Seiten', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const path of ['/', '/en/', '/apartments/', '/lage/', '/kontakt/', '/reisefuehrer/']) {
      await page.goto(path);
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')!));
      for (const href of hrefs) {
        if (!href.startsWith('/') || href.startsWith('//')) continue;
        const clean = href.split('#')[0];
        if (!clean || seen.has(clean)) continue;
        seen.add(clean);
        const res = await request.get(clean);
        expect(res.status(), `Link ${clean} (gefunden auf ${path})`).toBeLessThan(400);
      }
    }
  });

  test('Sitemap und robots.txt sind erreichbar', async ({ request }) => {
    expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');
  });
});
