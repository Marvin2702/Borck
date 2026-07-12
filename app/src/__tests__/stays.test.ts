// Nächte-Bilanz: Jahresgrenzen, laufender Aufenthalt, Level-Treppe.
import { guestLevel, nights, nightsInYear, stayStats } from '../lib/stays';

describe('nights', () => {
  it('zählt Kalendernächte', () => expect(nights('2026-07-10', '2026-07-17')).toBe(7));
  it('negativ/gleich ⇒ 0', () => {
    expect(nights('2026-07-17', '2026-07-10')).toBe(0);
    expect(nights('2026-07-10', '2026-07-10')).toBe(0);
  });
  it('kaputte Eingabe ⇒ 0', () => expect(nights('irgendwas', '2026-07-10')).toBe(0));
});

describe('nightsInYear (Silvester-Aufenthalt)', () => {
  const stay = { from: '2025-12-29', to: '2026-01-02' };
  it('Nacht 31.12.→1.1. zählt zum alten Jahr', () => {
    expect(nightsInYear(stay, 2025)).toBe(3); // 29., 30., 31.
    expect(nightsInYear(stay, 2026)).toBe(1); // 1.1.
  });
});

describe('stayStats', () => {
  const history = [
    { from: '2026-03-01', to: '2026-03-08' }, // 7 Nächte dieses Jahr
    { from: '2025-08-02', to: '2025-08-09' }, // 7 Nächte letztes Jahr
  ];

  it('mitten im laufenden Aufenthalt: verbracht + geplant', () => {
    const s = stayStats(history, { arrival: '2026-07-10', departure: '2026-07-17' }, '2026-07-12', 2026);
    expect(s.spentNights).toBe(7 + 2); // März + 10.→12.7.
    expect(s.plannedNights).toBe(5); // 12.→17.7.
    expect(s.totalStays).toBe(3);
    expect(s.lifetimeNights).toBe(7 + 7 + 7);
  });

  it('vor der Anreise: alles geplant, nichts verbracht', () => {
    const s = stayStats([], { arrival: '2026-07-20', departure: '2026-07-27' }, '2026-07-12', 2026);
    expect(s.spentNights).toBe(0);
    expect(s.plannedNights).toBe(7);
  });

  it('nach der Abreise: nichts mehr geplant', () => {
    const s = stayStats([], { arrival: '2026-07-01', departure: '2026-07-08' }, '2026-07-12', 2026);
    expect(s.spentNights).toBe(7);
    expect(s.plannedNights).toBe(0);
  });

  it('ohne Daten: nur Historie', () => {
    const s = stayStats(history, { arrival: null, departure: null }, '2026-07-12', 2026);
    expect(s.spentNights).toBe(7);
    expect(s.plannedNights).toBe(0);
    expect(s.totalStays).toBe(2);
  });
});

describe('guestLevel', () => {
  it('Treppe: Entdecker → Stammgast → Deichgraf', () => {
    expect(guestLevel(0).title).toBe('Nordsee-Entdecker');
    expect(guestLevel(7).title).toBe('Strandkorb-Stammgast');
    expect(guestLevel(21).title).toBe('Deichgraf');
    expect(guestLevel(21).next).toBeNull();
  });
});
