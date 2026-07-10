// =========================================================================
// Accessibility-Smoke: axe-core (WCAG 2.0/2.1 A+AA) auf den Kernseiten.
// Schlägt bei Verstößen mit Impact critical/serious fehl.
// =========================================================================
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/en/', '/apartments/', '/apartments/tuerkis/', '/kontakt/', '/lage/', '/ueber-uns/'];

for (const path of PAGES) {
  test(`Keine kritischen Accessibility-Verstöße auf ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Leaflet rendert eigene Controls, die wir nicht kontrollieren.
      .exclude('.leaflet-container')
      .analyze();
    const relevant = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(
      relevant.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5) })),
      `axe-Verstöße auf ${path}`
    ).toEqual([]);
  });
}
