// Service-Templates: gültige Struktur, {wohnung}-Platzhalter, WhatsApp-URL.
import { serviceRequests } from '../data/services';

describe('serviceRequests', () => {
  it('haben eindeutige Ids und nicht-leere Texte', () => {
    const ids = serviceRequests.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of serviceRequests) {
      expect(s.label.length).toBeGreaterThan(3);
      expect(s.template.length).toBeGreaterThan(10);
    }
  });

  it('Templates ergeben gültige wa.me-URLs', () => {
    for (const s of serviceRequests) {
      const text = s.template.replaceAll('{wohnung}', 'der Wohnung Türkis');
      const url = `https://wa.me/491727952082?text=${encodeURIComponent(text)}`;
      expect(() => new URL(url)).not.toThrow();
      expect(url).not.toContain('{wohnung}');
    }
  });
});
