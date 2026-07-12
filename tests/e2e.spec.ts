import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const PROD = 'https://www.nordsee-buesum-fewo.de';
const GA_ID = 'G-CI00000000';
const CONSENT_KEY = 'ha-consent-v2';

async function stubGoogle(page: Page) {
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: '',
  }));
  await page.route(/https:\/\/(?:region1\.)?google-analytics\.com\/.*/, (route) => route.fulfill({ status: 204, body: '' }));
}

async function acceptAnalytics(page: Page) {
  await expect(page.locator('[data-consent]')).toBeVisible();
  await page.locator('[data-consent-all]').click();
  await expect(page.locator('[data-consent]')).toBeHidden();
}

async function trackedEvents(page: Page): Promise<Array<{ name: string; params: unknown }>> {
  return page.evaluate(() => (window as any).dataLayer
    ?.map((entry: unknown) => Array.from(entry as ArrayLike<unknown>))
    .filter((entry: unknown[]) => entry[0] === 'event')
    .map((entry: unknown[]) => ({ name: entry[1], params: entry[2] })) ?? []);
}

function isoInDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

test.describe('SEO, Staging-Sicherheit und Kernseiten', () => {
  for (const [route, language] of [['/', 'de'], ['/en/', 'en'], ['/nl/', 'nl'], ['/da/', 'da']] as const) {
    test(`${language.toUpperCase()}-Startseite ist erreichbar`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('Produktions-Canonical, hreflang und bereinigtes LodgingBusiness sind konsistent', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${PROD}/`);
    for (const language of ['de', 'en', 'nl', 'da', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveCount(1);
    }
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const lodging = schemas.map((value) => JSON.parse(value)).find((value) => value['@type'] === 'LodgingBusiness');
    expect(lodging).toBeTruthy();
    expect(lodging.aggregateRating).toBeUndefined();
    expect(lodging.review).toBeUndefined();
  });

  test('Danke-Seiten sind noindex und nicht in der Sitemap', async ({ page, request }) => {
    await page.goto('/danke/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const sitemapIndex = await (await request.get('/sitemap-index.xml')).text();
    const matches = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)];
    for (const [, sitemapUrl] of matches) {
      const sitemap = await (await request.get(new URL(sitemapUrl).pathname)).text();
      expect(sitemap).not.toContain('/danke/');
    }
  });
});

test.describe('Consent Mode und Conversion-Events', () => {
  test('vor Einwilligung lädt kein Google-Tag; Ablehnung bleibt widerrufbar', async ({ page }) => {
    const googleRequests: string[] = [];
    page.on('request', (request) => {
      if (/googletagmanager|google-analytics/.test(request.url())) googleRequests.push(request.url());
    });
    await page.goto('/');
    await expect(page.locator('[data-consent]')).toBeVisible();
    await page.waitForTimeout(300);
    expect(googleRequests).toEqual([]);
    await page.locator('[data-consent-reject]').click();
    const choice = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), CONSENT_KEY);
    expect(choice).toMatchObject({ version: 2, analytics: false, marketing: false });
    await page.locator('[data-consent-open]').first().click();
    await expect(page.locator('[data-consent]')).toBeVisible();
  });

  test('Einwilligung setzt alle vier Consent-Signale und lädt GA4', async ({ page }) => {
    await stubGoogle(page);
    await page.goto('/');
    await acceptAnalytics(page);
    await expect(page.locator('#ha-google-tag')).toHaveAttribute('src', new RegExp(GA_ID));
    const consentUpdates = await page.evaluate(() => (window as any).dataLayer
      .map((entry: unknown) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry: unknown[]) => entry[0] === 'consent' && entry[1] === 'update'));
    expect(consentUpdates.at(-1)?.[2]).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  test('interne Kalender-CTAs blähen begin_booking nicht auf', async ({ page }) => {
    await stubGoogle(page);
    await page.goto('/');
    await acceptAnalytics(page);
    await page.evaluate(() => {
      document.addEventListener('click', (event) => {
        if ((event.target as Element | null)?.closest('.apt-book')) event.preventDefault();
      });
    });
    await page.locator('.apt-book').first().click();
    const events = await trackedEvents(page);
    expect(events.some((event) => event.name === 'select_apartment')).toBe(true);
    expect(events.some((event) => event.name === 'begin_booking')).toBe(false);
  });
});

test.describe('Kontaktformular und Danke-Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await stubGoogle(page);
    await page.route('https://api.web3forms.com/submit', async (route) => {
      const requestBody = route.request().postData() || '';
      expect(requestBody).toContain('access_key');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
  });

  test('gültige Anfrage führt zu /danke/ und genau einem generate_lead ohne PII', async ({ page }) => {
    await page.goto('/kontakt/');
    await acceptAnalytics(page);
    await page.locator('input[name="name"]').fill('E2E Testgast');
    await page.locator('input[name="email"]').fill('e2e@example.invalid');
    await page.locator('input[name="arrival"]').fill(isoInDays(30));
    await page.locator('input[name="departure"]').fill(isoInDays(37));
    await page.locator('select[name="apartment"]').selectOption({ label: 'Saphir' });
    await page.locator('input[name="guests"]').fill('2');
    await page.locator('textarea[name="message"]').fill('Automatisierter Browsertest.');
    await page.locator('[data-submit]').click();
    await expect(page).toHaveURL(/\/danke\/$/);
    await expect.poll(async () => (await trackedEvents(page)).filter((event) => event.name === 'generate_lead').length).toBe(1);
    const serialisedEvents = JSON.stringify(await trackedEvents(page));
    expect(serialisedEvents).not.toContain('E2E Testgast');
    expect(serialisedEvents).not.toContain('e2e@example.invalid');
    expect(serialisedEvents).not.toContain('Automatisierter Browsertest');
  });

  test('Datumspaar und Apartmentkapazität werden vor dem Versand validiert', async ({ page }) => {
    await page.goto('/kontakt/');
    await page.locator('[data-consent-reject]').click();
    const arrival = isoInDays(30);
    await page.locator('input[name="arrival"]').fill(arrival);
    await page.locator('input[name="departure"]').fill(arrival);
    expect(await page.locator('input[name="departure"]').evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
    await page.locator('input[name="departure"]').fill(isoInDays(37));
    await page.locator('select[name="apartment"]').selectOption({ label: 'Smaragd' });
    await page.locator('input[name="guests"]').fill('5');
    expect(await page.locator('input[name="guests"]').evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  });

  test('direkter Aufruf der Danke-Seite erzeugt kein Lead', async ({ page }) => {
    await page.goto('/');
    await acceptAnalytics(page);
    await page.goto('/danke/');
    await page.waitForTimeout(200);
    expect((await trackedEvents(page)).some((event) => event.name === 'generate_lead')).toBe(false);
  });
});

test.describe('Buchungsweg und mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ version: 2, analytics: false, marketing: false, updatedAt: new Date().toISOString() }));
    }, CONSENT_KEY);
  });

  test('Start und Übersicht besitzen die offizielle Suche über alle Apartments', async ({ page }) => {
    for (const route of ['/', '/apartments/']) {
      await page.goto(route);
      const widget = page.locator('#verfuegbarkeit[data-booking-mode="all"]');
      await expect(widget).toBeAttached();
      await expect(widget.locator('.booking-embed')).toHaveAttribute('data-user', '40536');
    }
  });

  test('Karten-CTA bleibt intern und landet am Einzelkalender', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.apt-book').first().getAttribute('href');
    expect(href).toMatch(/^\/apartments\/[a-z0-9-]+\/#buchung$/);
    await page.locator('.apt-book').first().click();
    await expect(page).toHaveURL(/\/apartments\/[a-z0-9-]+\/#buchung$/);
    await expect(page.locator('#buchung[data-booking-mode="apartment"]')).toBeAttached();
  });

  test('mobiles Menü aktualisiert aria-expanded und schließt per Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.locator('[data-navtoggle]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#site-nav')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('Detailgalerie lädt streng viewportnah und die Lightbox nutzt das große Bild', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    const imageRequests: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'image') imageRequests.push(request.url());
    });
    await page.goto('/apartments/saphir/');
    await page.waitForTimeout(250);
    expect(imageRequests.some((url) => url.includes('saphir-kitchen-'))).toBe(false);

    const kitchen = page.locator('[data-lightbox-item]').nth(4);
    await kitchen.scrollIntoViewIfNeeded();
    await expect.poll(() => imageRequests.some((url) => url.includes('saphir-kitchen-'))).toBe(true);

    const secondImage = page.locator('[data-lightbox-item]').nth(1);
    await secondImage.scrollIntoViewIfNeeded();
    await secondImage.click();
    await expect(page.locator('[data-lightbox] .lightbox-img')).toHaveAttribute('src', /saphir-open-living-1600\.jpg$/);
  });
});

test('Desktop-/Mobile-Screenshot-Suite der fünf Kernansichten', async ({ browser }) => {
  const output = path.resolve('test-results/screenshots');
  await fs.mkdir(output, { recursive: true });
  const pages = [
    ['home', '/'],
    ['apartments', '/apartments/'],
    ['detail-saphir', '/apartments/saphir/'],
    ['contact', '/kontakt/'],
    ['thanks', '/danke/'],
  ] as const;
  const viewports = [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ] as const;

  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport, baseURL: 'http://127.0.0.1:4321', locale: 'de-DE' });
    await context.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ version: 2, analytics: false, marketing: false, updatedAt: new Date().toISOString() }));
    }, CONSENT_KEY);
    await context.route(/https:\/\/.*smoobu\.com\/.*/, (route) => route.abort());
    const page = await context.newPage();
    for (const [name, route] of pages) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(output, `${name}-${viewportName}.png`), fullPage: false });
    }
    await context.close();
  }
});
