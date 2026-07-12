// =========================================================================
// „Entdecken"-Logik: Stimmungs-Runde (gewichtet, filtert nie hart), Deck-
// Reihenfolge, Duo-Zustandsmaschine und Match-Berechnung — alles pure
// Funktionen (testbar ohne Gesten/UI). Matches werden NIE gespeichert,
// sondern immer aus der Schnittmenge abgeleitet (v3-Remote-Sync-ready).
// =========================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Activity } from '../content';

export const SUPERLIKE_LIMIT = 3;

export type SwipeAction = 'like' | 'nope' | 'super';
export type PlayerId = 'A' | 'B';
export type Phase = 'setup' | 'mood' | 'deck' | 'handover' | 'reveal' | 'summary' | 'done';
export type WeatherClass = 'sonne' | 'wolken' | 'schietwetter';

export type Player = {
  name: string;
  avatar: string;
  /** Gelikte Mood-Ids aus der Stimmungs-Runde. */
  moods: string[];
  /** Activity-Id -> Aktion (nur like/super; Nopes brauchen wir nicht). */
  likes: Record<string, 'like' | 'super'>;
  done: boolean;
};

export type Session = {
  v: 1;
  mode: 'solo' | 'duo';
  phase: Phase;
  active: PlayerId;
  seed: number;
  startedAt: string;
  players: { A: Player; B?: Player };
};

const newPlayer = (name: string, avatar: string): Player => ({
  name,
  avatar,
  moods: [],
  likes: {},
  done: false,
});

export function createSession(mode: 'solo' | 'duo', seed: number, names?: [string, string]): Session {
  return {
    v: 1,
    mode,
    phase: 'mood',
    active: 'A',
    seed,
    startedAt: new Date().toISOString(),
    players:
      mode === 'duo'
        ? { A: newPlayer(names?.[0] || 'Person 1', '🦭'), B: newPlayer(names?.[1] || 'Person 2', '🦀') }
        : { A: newPlayer(names?.[0] || 'Du', '🦭') },
  };
}

// --- Deterministischer Shuffle (mulberry32) --------------------------------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const r = rng(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deck-Reihenfolge: +2 je gelikter Mood, +1 Wetter-Bonus (Regen→indoor,
 * Sonne→outdoor), +2 für Iris' Lieblinge (boostIds) — auf die Gastgeberin
 * hört man. Innerhalb gleicher Punktzahl seeded-geshuffelt — alle Karten
 * bleiben im Stapel, genopte Moods rutschen nur nach hinten.
 */
export function orderDeck(
  activities: Activity[],
  likedMoods: string[],
  weather: WeatherClass | null,
  seed: number,
  excludeIds: string[] = [],
  boostIds: readonly string[] = []
): Activity[] {
  const liked = new Set(likedMoods);
  const boosted = new Set(boostIds);
  const score = (a: Activity) => {
    let s = 0;
    for (const m of a.mood) if (liked.has(m)) s += 2;
    if (weather === 'schietwetter' && a.indoor) s += 1;
    if (weather === 'sonne' && !a.indoor) s += 1;
    if (boosted.has(a.id)) s += 2;
    return s;
  };
  const excluded = new Set(excludeIds);
  return seededShuffle(
    activities.filter((a) => !excluded.has(a.id)),
    seed
  )
    .map((a, i) => ({ a, s: score(a), i }))
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .map((x) => x.a);
}

// --- Swipes -----------------------------------------------------------------
export function superlikesUsed(p: Player): number {
  return Object.values(p.likes).filter((v) => v === 'super').length;
}

export function applyMoodSwipe(session: Session, moodId: string, action: SwipeAction): Session {
  const p = session.players[session.active]!;
  const moods = action === 'nope' ? p.moods : [...p.moods, moodId];
  return { ...session, players: { ...session.players, [session.active]: { ...p, moods } } };
}

export function applyDeckSwipe(session: Session, activityId: string, action: SwipeAction): Session {
  const p = session.players[session.active]!;
  if (action === 'nope') return session;
  const effective: 'like' | 'super' =
    action === 'super' && superlikesUsed(p) >= SUPERLIKE_LIMIT ? 'like' : action === 'super' ? 'super' : 'like';
  return {
    ...session,
    players: { ...session.players, [session.active]: { ...p, likes: { ...p.likes, [activityId]: effective } } },
  };
}

/** Phasen-Übergang nach Abschluss der aktuellen Phase. */
export function nextPhase(session: Session): Session {
  const { mode, phase, active } = session;
  if (phase === 'mood') return { ...session, phase: 'deck' };
  if (phase === 'deck') {
    const players = {
      ...session.players,
      [active]: { ...session.players[active]!, done: true },
    };
    if (mode === 'solo') return { ...session, players, phase: 'summary' };
    if (active === 'A') return { ...session, players, phase: 'handover' };
    return { ...session, players, phase: 'reveal' };
  }
  if (phase === 'handover') return { ...session, phase: 'mood', active: 'B' };
  if (phase === 'reveal' || phase === 'summary') return { ...session, phase: 'done' };
  return session;
}

// --- Matches -----------------------------------------------------------------
export type Match = { id: string; perfect: boolean };

/** Schnittmenge beider Like-Sets; Superlike×Superlike = „Traum-Match". */
export function computeMatches(a: Player, b: Player): Match[] {
  const out: Match[] = [];
  for (const [id, va] of Object.entries(a.likes)) {
    const vb = b.likes[id];
    if (vb) out.push({ id, perfect: va === 'super' && vb === 'super' });
  }
  return out.sort((x, y) => Number(y.perfect) - Number(x.perfect));
}

// --- Gesten-Entscheidung (pure, von SwipeDeck genutzt) ----------------------
export function decideAction(
  dx: number,
  dy: number,
  vx: number,
  width: number,
  height: number
): SwipeAction | 'reset' {
  if (dy < -0.22 * height && Math.abs(dx) < 0.3 * width) return 'super';
  if (dx > 0.32 * width || vx > 800) return 'like';
  if (dx < -0.32 * width || vx < -800) return 'nope';
  return 'reset';
}

// --- Session-Persistenz (bewusst NICHT im GuestContext: ändert sich je Geste)
const SESSION_KEY = 'gast.swipe.session';

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return s.v === 1 && s.phase !== 'done' ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null): void {
  if (s && s.phase !== 'done') void AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else void AsyncStorage.removeItem(SESSION_KEY);
}
