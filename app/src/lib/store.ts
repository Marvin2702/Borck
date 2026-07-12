// =========================================================================
// Leichter App-Zustand: gewählte Wohnung, Abreisedatum, Erinnerungs-Opt-in,
// Checklisten-Häkchen — persistiert in AsyncStorage, verteilt per Context.
// Bewusst kein Zustand/Redux: vier Werte, einmal beim Start gelesen.
// =========================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext } from 'react';

const KEYS = {
  apartment: 'gast.apartment',
  departure: 'gast.departure', // ISO YYYY-MM-DD
  reminder: 'gast.reminder', // '1' | ''
  checklist: 'gast.checklist', // JSON: number[] (abgehakte Indizes)
  plan: 'gast.plan', // JSON: PlanItem[]
  checkins: 'gast.checkins', // JSON: Record<activityId, Checkin>
  badges: 'gast.badges', // JSON: Record<badgeId, isoDate>
} as const;

/** Eintrag im Urlaubsplan. `source: 'match'` = im Duo gemeinsam gewählt.
 *  Matches werden NIE separat gespeichert, sondern beim Übernehmen aus der
 *  Schnittmenge abgeleitet — v3-Remote-Sync kann dieselbe Struktur mergen. */
export type PlanItem = {
  id: string; // Activity-Id aus content.json
  addedAt: string;
  source: 'solo' | 'match';
  superlike: boolean;
};

export type Checkin = { date: string; weather?: 'sonne' | 'wolken' | 'schietwetter' };

export type GuestState = {
  apartment: string | null;
  departure: string | null;
  reminder: boolean;
  checklist: number[];
  plan: PlanItem[];
  checkins: Record<string, Checkin>;
  badges: Record<string, string>;
};

export const emptyState: GuestState = {
  apartment: null,
  departure: null,
  reminder: false,
  checklist: [],
  plan: [],
  checkins: {},
  badges: {},
};

export async function loadState(): Promise<GuestState> {
  try {
    const [apartment, departure, reminder, checklist, plan, checkins, badges] = await AsyncStorage.multiGet(
      Object.values(KEYS)
    ).then((e) => e.map(([, v]) => v));
    return {
      apartment: apartment || null,
      departure: departure || null,
      reminder: reminder === '1',
      checklist: checklist ? (JSON.parse(checklist) as number[]) : [],
      plan: plan ? (JSON.parse(plan) as PlanItem[]) : [],
      checkins: checkins ? (JSON.parse(checkins) as Record<string, Checkin>) : {},
      badges: badges ? (JSON.parse(badges) as Record<string, string>) : {},
    };
  } catch {
    return emptyState;
  }
}

export const persist = {
  apartment: (slug: string | null) =>
    slug ? AsyncStorage.setItem(KEYS.apartment, slug) : AsyncStorage.removeItem(KEYS.apartment),
  departure: (iso: string | null) =>
    iso ? AsyncStorage.setItem(KEYS.departure, iso) : AsyncStorage.removeItem(KEYS.departure),
  reminder: (on: boolean) => AsyncStorage.setItem(KEYS.reminder, on ? '1' : ''),
  checklist: (idx: number[]) => AsyncStorage.setItem(KEYS.checklist, JSON.stringify(idx)),
  plan: (items: PlanItem[]) => AsyncStorage.setItem(KEYS.plan, JSON.stringify(items)),
  checkins: (c: Record<string, Checkin>) => AsyncStorage.setItem(KEYS.checkins, JSON.stringify(c)),
  badges: (b: Record<string, string>) => AsyncStorage.setItem(KEYS.badges, JSON.stringify(b)),
};

export type GuestContextValue = GuestState & {
  setApartment: (slug: string | null) => void;
  setDeparture: (iso: string | null) => void;
  setReminder: (on: boolean) => void;
  toggleChecklist: (index: number) => void;
  /** Fügt Likes/Matches dem Plan hinzu (dedupliziert; Superlike/Match gewinnen). */
  addToPlan: (items: PlanItem[]) => void;
  removeFromPlan: (id: string) => void;
  /** „Waren wir!" — Check-in inkl. eingefrorener Wetterklasse; liefert neue Badges. */
  checkin: (id: string, weather?: Checkin['weather']) => void;
  setBadges: (b: Record<string, string>) => void;
  resetVacationData: () => void;
};

export const GuestContext = createContext<GuestContextValue>({
  ...emptyState,
  setApartment: () => {},
  setDeparture: () => {},
  setReminder: () => {},
  toggleChecklist: () => {},
  addToPlan: () => {},
  removeFromPlan: () => {},
  checkin: () => {},
  setBadges: () => {},
  resetVacationData: () => {},
});

export const useGuest = () => useContext(GuestContext);
