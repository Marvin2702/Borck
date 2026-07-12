// Iris' Lieblinge: gültige Ids, Deck-Boost, „Iris' Best"-Badge.
import { content } from '../content';
import { badgeDefs } from '../data/badges';
import { IRIS_BADGE_TARGET, irisFavoriten } from '../data/guestInfo';
import { evaluateBadges } from '../lib/badges';
import { orderDeck } from '../lib/discover';

describe('irisFavoriten', () => {
  it('jede Id existiert im Erlebnis-Katalog', () => {
    const valid = new Set(content.activities.map((a) => a.id));
    for (const id of irisFavoriten) expect(valid.has(id)).toBe(true);
  });

  it('genug Lieblinge für den Badge', () => {
    expect(irisFavoriten.length).toBeGreaterThanOrEqual(IRIS_BADGE_TARGET);
  });

  it('Badge-Definition existiert', () => {
    expect(badgeDefs.some((d) => d.id === 'iris-best')).toBe(true);
  });
});

describe('Deck-Boost', () => {
  it('Iris-Lieblinge rutschen nach vorn', () => {
    const deck = orderDeck(content.activities, [], null, 42, [], irisFavoriten);
    const topIds = deck.slice(0, irisFavoriten.length).map((a) => a.id);
    for (const id of topIds) expect(irisFavoriten).toContain(id);
    expect(deck).toHaveLength(content.activities.length); // nie filtern
  });
});

describe('„Iris\' Best"-Badge', () => {
  it(`ab ${IRIS_BADGE_TARGET} erlebten Lieblingen verdient`, () => {
    const two = Object.fromEntries(irisFavoriten.slice(0, IRIS_BADGE_TARGET - 1).map((id) => [id, { date: 'x' }]));
    expect(evaluateBadges(two)).not.toContain('iris-best');
    const three = Object.fromEntries(irisFavoriten.slice(0, IRIS_BADGE_TARGET).map((id) => [id, { date: 'x' }]));
    expect(evaluateBadges(three)).toContain('iris-best');
  });
});
