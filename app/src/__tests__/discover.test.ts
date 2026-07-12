// Entdecken-Logik: Deck-Gewichtung, Duo-Zustandsmaschine, Matches, Gesten.
import { content } from '../content';
import {
  SUPERLIKE_LIMIT,
  applyDeckSwipe,
  applyMoodSwipe,
  computeMatches,
  createSession,
  decideAction,
  nextPhase,
  orderDeck,
  superlikesUsed,
} from '../lib/discover';

describe('orderDeck (Gewichtung statt Filter)', () => {
  it('behält IMMER alle Karten im Stapel', () => {
    const deck = orderDeck(content.activities, ['watt'], null, 42);
    expect(deck).toHaveLength(content.activities.length);
  });

  it('sortiert gelikte Moods nach vorn', () => {
    const deck = orderDeck(content.activities, ['wellness'], null, 42);
    expect(deck[0].mood).toContain('wellness');
  });

  it('boostet Indoor bei Schietwetter', () => {
    const rain = orderDeck(content.activities, [], 'schietwetter', 42);
    const indoorRank = rain.findIndex((a) => a.indoor);
    expect(indoorRank).toBeLessThan(3);
  });

  it('ist deterministisch je Seed und variiert zwischen Seeds', () => {
    const a = orderDeck(content.activities, [], null, 1).map((x) => x.id);
    const b = orderDeck(content.activities, [], null, 1).map((x) => x.id);
    const c = orderDeck(content.activities, [], null, 2).map((x) => x.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

describe('Duo-Zustandsmaschine', () => {
  it('läuft mood→deck→handover→mood(B)→deck→reveal→done', () => {
    let s = createSession('duo', 7);
    expect(s.phase).toBe('mood');
    s = nextPhase(s); // A: deck
    expect(s.phase).toBe('deck');
    s = nextPhase(s); // A fertig
    expect(s.phase).toBe('handover');
    expect(s.players.A.done).toBe(true);
    s = nextPhase(s); // B: mood
    expect(s.phase).toBe('mood');
    expect(s.active).toBe('B');
    s = nextPhase(s);
    s = nextPhase(s);
    expect(s.phase).toBe('reveal');
    s = nextPhase(s);
    expect(s.phase).toBe('done');
  });

  it('Solo endet im summary', () => {
    let s = createSession('solo', 7);
    s = nextPhase(s);
    s = nextPhase(s);
    expect(s.phase).toBe('summary');
  });

  it('Mood-Nope filtert nichts, sondern liked nur nicht', () => {
    let s = createSession('solo', 7);
    s = applyMoodSwipe(s, 'watt', 'like');
    s = applyMoodSwipe(s, 'kultur', 'nope');
    expect(s.players.A.moods).toEqual(['watt']);
  });

  it('deckelt Superlikes auf das Limit (weitere werden normale Likes)', () => {
    let s = createSession('solo', 7);
    const ids = content.activities.slice(0, SUPERLIKE_LIMIT + 2).map((a) => a.id);
    for (const id of ids) s = applyDeckSwipe(s, id, 'super');
    expect(superlikesUsed(s.players.A)).toBe(SUPERLIKE_LIMIT);
    expect(Object.keys(s.players.A.likes)).toHaveLength(SUPERLIKE_LIMIT + 2);
  });
});

describe('computeMatches', () => {
  const player = (likes: Record<string, 'like' | 'super'>) => ({
    name: 'x',
    avatar: '🦭',
    moods: [],
    likes,
    done: true,
  });

  it('findet die Schnittmenge und erkennt Traum-Matches', () => {
    const a = player({ one: 'like', two: 'super', three: 'like' });
    const b = player({ two: 'super', three: 'like', four: 'like' });
    const matches = computeMatches(a, b);
    expect(matches.map((m) => m.id).sort()).toEqual(['three', 'two']);
    expect(matches.find((m) => m.id === 'two')?.perfect).toBe(true);
    expect(matches[0].id).toBe('two'); // Traum-Match zuerst
  });

  it('leere Schnittmenge = keine Matches', () => {
    expect(computeMatches(player({ a: 'like' }), player({ b: 'like' }))).toEqual([]);
  });
});

describe('decideAction (Gesten-Schwellen)', () => {
  const W = 390;
  const H = 800;
  it.each([
    [200, 0, 0, 'like'],
    [-200, 0, 0, 'nope'],
    [10, 0, 900, 'like'],
    [-10, 0, -900, 'nope'],
    [0, -200, 0, 'super'],
    [10, -10, 0, 'reset'],
  ])('dx=%i dy=%i vx=%i → %s', (dx, dy, vx, expected) => {
    expect(decideAction(dx as number, dy as number, vx as number, W, H)).toBe(expected);
  });
});
