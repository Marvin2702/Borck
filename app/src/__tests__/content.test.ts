// Content-Vertrag: schlägt an, wenn Website-Export und App auseinanderlaufen.
import { content, slugFromUrl } from '../content';

describe('content.json (Export-Vertrag)', () => {
  it('enthält alle 7 Apartments in Website-Reihenfolge', () => {
    expect(content.apartments).toHaveLength(7);
    expect(content.apartments.map((a) => a.slug)).toEqual([
      'tuerkis',
      'saphir',
      'bernstein',
      'topas',
      'rubin',
      'opal',
      'smaragd',
    ]);
  });

  it('enthält die 6 Reiseführer mit Blöcken', () => {
    expect(content.guides).toHaveLength(6);
    for (const g of content.guides) expect(g.blocks.length).toBeGreaterThan(3);
  });

  it('liefert Kontakt- und Buchungsdaten', () => {
    expect(content.site.phone).toMatch(/^\+?\d+$/);
    expect(content.site.bookingUrl).toContain('smoobu');
    expect(content.site.googleProfileUrl).toContain('google');
  });
});

describe('slugFromUrl (Deep-Link-Vertrag: QR → Wohnung)', () => {
  it.each([
    ['hausaquamarin://wohnung/bernstein', 'bernstein'],
    ['https://www.nordsee-buesum-fewo.de/gast/tuerkis', 'tuerkis'],
    ['https://www.nordsee-buesum-fewo.de/gast/tuerkis/', 'tuerkis'],
    ['hausaquamarin://wohnung/TOPAS', 'topas'],
  ])('%s → %s', (url, slug) => {
    expect(slugFromUrl(url)).toBe(slug);
  });

  it('lehnt unbekannte Wohnungen ab', () => {
    expect(slugFromUrl('hausaquamarin://wohnung/penthouse')).toBeNull();
    expect(slugFromUrl('https://example.com/foo')).toBeNull();
  });
});
