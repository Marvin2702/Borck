// TODO-Wächter: warnt in CI, solange Platzhalter in guestInfo übrig sind.
// Vor dem Store-Release STRICT_TODOS=1 setzen — dann schlägt der Test fehl,
// damit keine Platzhalter beim Gast landen (siehe docs/app-golive.md).
import { checkoutChecklist, gaestemappe, irisTipps, notfall, perApartment } from '../data/guestInfo';

const collectTodos = (): string[] => {
  const todos: string[] = [];
  const scan = (label: string, value: string) => {
    if (value.startsWith('TODO')) todos.push(label);
  };
  for (const [slug, info] of Object.entries(perApartment)) {
    scan(`${slug}.wifi.ssid`, info.wifi.ssid);
    scan(`${slug}.wifi.password`, info.wifi.password);
    info.checkinSteps.forEach((s, i) => scan(`${slug}.checkinSteps[${i}]`, s));
    scan(`${slug}.parking`, info.parking);
  }
  gaestemappe.forEach((sec) => sec.lines.forEach((l, i) => scan(`mappe.${sec.title}[${i}]`, l)));
  irisTipps.forEach((t, i) => scan(`tipps[${i}]`, t.title));
  notfall.forEach((n) => scan(`notfall.${n.title}`, n.value));
  checkoutChecklist.forEach((c, i) => scan(`checkliste[${i}]`, c));
  return todos;
};

describe('guestInfo-Pflegezustand', () => {
  it('meldet offene TODO-Platzhalter', () => {
    const todos = collectTodos();
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
