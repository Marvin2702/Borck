// Drift-Guard: Jede Aktivität und jeder Mood hat ein Premium-Motiv,
// und die Map enthält keine Waisen-Keys (Muster: unique-id-Guard im Export).
import { content } from '../content';
import { activityArt, cardScrim } from '../data/activityArt';

describe('activityArt', () => {
  it('hat ein Motiv für jede Aktivität', () => {
    for (const a of content.activities) {
      expect(activityArt[a.id]).toBeDefined();
    }
  });

  it('hat ein Motiv für jede Mood-Karte', () => {
    for (const m of content.moods) {
      expect(activityArt[`mood-${m.id}`]).toBeDefined();
    }
  });

  it('enthält keine Waisen-Keys', () => {
    const valid = new Set([...content.activities.map((a) => a.id), ...content.moods.map((m) => `mood-${m.id}`)]);
    for (const key of Object.keys(activityArt)) {
      expect(valid.has(key)).toBe(true);
    }
  });

  it('Scrim-Asset ist vorhanden', () => {
    expect(cardScrim).toBeDefined();
  });
});
