// =========================================================================
// Badge-Auswertung (pure): Check-ins rein, verdiente Badge-Ids raus.
// Die Wetterklasse wird beim Check-in eingefroren (gast.checkins) — so bleibt
// „Schietwetter-Held" auch verdient, wenn morgen die Sonne scheint.
// =========================================================================
import { activityById } from '../content';
import type { Checkin } from './store';

const WATT_IDS = new Set(['wattwanderung-schutzstation', 'wattfuehrung-fuer-alle', 'kronenloch-voegel']);
const SEEHUND_IDS = new Set(['seehundsbank-fahrt', 'seehundstation-friedrichskoog']);
const WELLEN_IDS = new Set(['meerzeit-wellenbad', 'spa-meerzeit', 'wassersport-schule', 'perlebucht-lagune']);

export function evaluateBadges(checkins: Record<string, Checkin>): string[] {
  const ids = Object.keys(checkins);
  if (ids.length === 0) return [];

  const earned = new Set<string>(['moin']);
  for (const id of ids) {
    if (WATT_IDS.has(id)) earned.add('wattlaeufer');
    if (SEEHUND_IDS.has(id)) earned.add('seehund-spotter');
    if (id === 'hafen-leuchtturm') earned.add('leuchtturm-fan');
    if (WELLEN_IDS.has(id)) earned.add('wellenreiter');
    if (checkins[id].weather === 'schietwetter') earned.add('schietwetter-held');
    const act = activityById(id);
    if (act && act.km > 10) earned.add('landratte');
  }
  if (ids.length >= 5) earned.add('buesum-profi');
  return [...earned];
}

/** Diff-Helfer: welche Badges sind NEU dazugekommen (für Konfetti-Moment). */
export function newBadges(before: Record<string, string>, checkins: Record<string, Checkin>): string[] {
  return evaluateBadges(checkins).filter((id) => !(id in before));
}
