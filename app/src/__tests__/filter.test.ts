// Schietwetter-Filter der „Was machen wir heute?"-Liste.
import { matchesFilter } from '../app/heute/index';
import { content } from '../content';

const bySlug = (slug: string) => content.guides.find((g) => g.slug === slug)!;

describe('matchesFilter', () => {
  it('zeigt bei Schietwetter Indoor + Praktisches, aber kein Outdoor', () => {
    expect(matchesFilter(bySlug('buesum-bei-schietwetter'), 'schietwetter')).toBe(true);
    expect(matchesFilter(bySlug('anreise-buesum'), 'schietwetter')).toBe(true);
    expect(matchesFilter(bySlug('wattwandern-buesum'), 'schietwetter')).toBe(false);
  });

  it('zeigt bei Draußen-Wetter kein Indoor-Programm', () => {
    expect(matchesFilter(bySlug('buesum-bei-schietwetter'), 'draussen')).toBe(false);
    expect(matchesFilter(bySlug('strand-perlebucht-buesum'), 'draussen')).toBe(true);
  });

  it('zeigt bei „alle" alles', () => {
    expect(content.guides.every((g) => matchesFilter(g, 'alle'))).toBe(true);
  });
});
