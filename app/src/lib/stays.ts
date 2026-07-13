// =========================================================================
// Aufenthalts-Bilanz: pure Datums-Rechnerei für den Meilensteine-Screen.
// Eine „Nacht" gehört zu dem Kalenderjahr, in dem sie BEGINNT (die Nacht
// vom 31.12. auf den 1.1. zählt also noch zum alten Jahr).
// Alle Daten sind ISO-Strings (YYYY-MM-DD, lokale Kalendertage).
// =========================================================================

export type Stay = { from: string; to: string };

const DAY = 86_400_000;

export function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T12:00:00`); // Mittag: DST-sicher
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Nächte zwischen zwei Kalendertagen (negativ ⇒ 0). */
export function nights(from: string, to: string): number {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY));
}

/** Wie viele Nächte eines Aufenthalts beginnen im Jahr `year`? */
export function nightsInYear(stay: Stay, year: number): number {
  const a = parseIsoDate(stay.from);
  const b = parseIsoDate(stay.to);
  if (!a || !b) return 0;
  let count = 0;
  for (let t = a.getTime(); t < b.getTime(); t += DAY) {
    if (new Date(t).getFullYear() === year) count++;
  }
  return count;
}

export type StayStats = {
  /** bereits verbrachte Nächte in `year` (Historie + laufender Aufenthalt bis heute) */
  spentNights: number;
  /** ab heute noch geplante Nächte des laufenden Aufenthalts */
  plannedNights: number;
  /** Aufenthalte gesamt (Historie + laufender, falls Daten gesetzt) */
  totalStays: number;
  /** alle Nächte über alle Jahre (für das Stammgast-Level) */
  lifetimeNights: number;
};

/**
 * Bilanz aus archivierten Aufenthalten + dem laufenden (arrival/departure).
 * `todayIso` kommt von außen (testbar, keine versteckte Uhr).
 */
export function stayStats(
  stays: Stay[],
  current: { arrival: string | null; departure: string | null },
  todayIso: string,
  year: number
): StayStats {
  let spentNights = 0;
  let lifetimeNights = 0;
  for (const s of stays) {
    spentNights += nightsInYear(s, year);
    lifetimeNights += nights(s.from, s.to);
  }

  let plannedNights = 0;
  let hasCurrent = false;
  if (current.arrival && current.departure && nights(current.arrival, current.departure) > 0) {
    hasCurrent = true;
    const spentEnd = todayIso < current.departure ? todayIso : current.departure;
    if (current.arrival < spentEnd) {
      spentNights += nightsInYear({ from: current.arrival, to: spentEnd }, year);
      lifetimeNights += nights(current.arrival, spentEnd);
    }
    const planStart = todayIso > current.arrival ? todayIso : current.arrival;
    plannedNights = nights(planStart, current.departure);
    lifetimeNights += plannedNights;
  }

  return { spentNights, plannedNights, totalStays: stays.length + (hasCurrent ? 1 : 0), lifetimeNights };
}

/** Stammgast-Level nach Lebenszeit-Nächten — sprachneutral (Screen übersetzt). */
export type GuestLevel = {
  icon: string;
  key: 'explorer' | 'regular' | 'deichgraf';
  next: { key: 'nextRegular' | 'nextDeichgraf'; n: number } | null;
};

export function guestLevel(lifetimeNights: number): GuestLevel {
  if (lifetimeNights >= 21) return { icon: '👑', key: 'deichgraf', next: null };
  if (lifetimeNights >= 7)
    return { icon: '⛱️', key: 'regular', next: { key: 'nextDeichgraf', n: 21 - lifetimeNights } };
  return { icon: '🐚', key: 'explorer', next: { key: 'nextRegular', n: Math.max(1, 7 - lifetimeNights) } };
}
