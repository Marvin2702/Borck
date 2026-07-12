// TODO-Wächter: warnt in CI, solange Platzhalter in guestInfo übrig sind.
// Vor dem Store-Release STRICT_TODOS=1 setzen — dann schlägt der Test fehl,
// damit keine Platzhalter beim Gast landen (siehe docs/app-golive.md).
import {
  checkoutChecklist,
  gaestemappe,
  gezeiten,
  irisTipps,
  notfall,
  perApartment,
} from '../data/guestInfo';

const collectTodos = (value: unknown, path = 'guestInfo'): string[] => {
  if (typeof value === 'string') return /\bTODO\s*:/i.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectTodos(entry, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => collectTodos(entry, `${path}.${key}`));
  }
  return [];
};

const guestInfo = { perApartment, gaestemappe, irisTipps, notfall, checkoutChecklist, gezeiten };

describe('guestInfo-Pflegezustand', () => {
  it('findet TODOs rekursiv in Objekten und Arrays', () => {
    expect(
      collectTodos(
        {
          irisTipps: [{ title: 'Fertig', text: 'TODO: Beschreibung' }],
          gezeiten: { intro: 'TODO : Hinweis' },
        },
        'probe'
      )
    ).toEqual(['probe.irisTipps[0].text', 'probe.gezeiten.intro']);
  });

  it('meldet offene TODO-Platzhalter', () => {
    const todos = collectTodos(guestInfo);
    if (todos.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  ${todos.length} TODO-Platzhalter in guestInfo.ts offen:\n  - ${todos.join('\n  - ')}`);
    }
    if (process.env.STRICT_TODOS === '1') {
      expect(todos).toEqual([]);
    } else {
      expect(Array.isArray(todos)).toBe(true);
    }
  });
});
