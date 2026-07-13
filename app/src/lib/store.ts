// =========================================================================
// Leichter App-Zustand: gewählte Wohnung, Abreisedatum, Erinnerungs-Opt-in,
// Checklisten-Häkchen — persistiert in AsyncStorage, verteilt per Context.
// Bewusst kein Zustand/Redux: vier Werte, einmal beim Start gelesen.
// =========================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext } from 'react';
import { detectLang, makeT, type Lang, type TFn } from '../i18n';
import type { Stay } from './stays';

const KEYS = {
  lang: 'gast.lang', // 'de' | 'en' | 'nl' | 'da'
  apartment: 'gast.apartment',
  arrival: 'gast.arrival', // ISO YYYY-MM-DD (laufender Aufenthalt)
  departure: 'gast.departure', // ISO YYYY-MM-DD
  reminder: 'gast.reminder', // '1' | ''
  checklist: 'gast.checklist', // JSON: number[] (abgehakte Indizes)
  plan: 'gast.plan', // JSON: PlanItem[]
  checkins: 'gast.checkins', // JSON: Record<activityId, Checkin>
  badges: 'gast.badges', // JSON: Record<badgeId, isoDate>
  stays: 'gast.stays', // JSON: Stay[] — abgeschlossene Aufenthalte (Nächte-Bilanz)
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
  lang: Lang;
  apartment: string | null;
  arrival: string | null;
  departure: string | null;
  reminder: boolean;
  checklist: number[];
  plan: PlanItem[];
  checkins: Record<string, Checkin>;
  badges: Record<string, string>;
  stays: Stay[];
};

export const emptyState: GuestState = {
  lang: 'de',
  apartment: null,
  arrival: null,
  departure: null,
  reminder: false,
  checklist: [],
  plan: [],
  checkins: {},
  badges: {},
  stays: [],
};

const isLang = (v: string | null): v is Lang => v === 'de' || v === 'en' || v === 'nl' || v === 'da';

export async function loadState(): Promise<GuestState> {
  try {
    const [lang, apartment, arrival, departure, reminder, checklist, plan, checkins, badges, stays] =
      await AsyncStorage.multiGet(Object.values(KEYS)).then((e) => e.map(([, v]) => v));
    return {
      lang: isLang(lang) ? lang : detectLang(),
      apartment: apartment || null,
      arrival: arrival || null,
      departure: departure || null,
      reminder: reminder === '1',
      checklist: checklist ? (JSON.parse(checklist) as number[]) : [],
      plan: plan ? (JSON.parse(plan) as PlanItem[]) : [],
      checkins: checkins ? (JSON.parse(checkins) as Record<string, Checkin>) : {},
      badges: badges ? (JSON.parse(badges) as Record<string, string>) : {},
      stays: stays ? (JSON.parse(stays) as Stay[]) : [],
    };
  } catch {
    return emptyState;
  }
}

export const persist = {
  lang: (l: Lang) => AsyncStorage.setItem(KEYS.lang, l),
  apartment: (slug: string | null) =>
    slug ? AsyncStorage.setItem(KEYS.apartment, slug) : AsyncStorage.removeItem(KEYS.apartment),
  arrival: (iso: string | null) =>
    iso ? AsyncStorage.setItem(KEYS.arrival, iso) : AsyncStorage.removeItem(KEYS.arrival),
  departure: (iso: string | null) =>
    iso ? AsyncStorage.setItem(KEYS.departure, iso) : AsyncStorage.removeItem(KEYS.departure),
  reminder: (on: boolean) => AsyncStorage.setItem(KEYS.reminder, on ? '1' : ''),
  checklist: (idx: number[]) => AsyncStorage.setItem(KEYS.checklist, JSON.stringify(idx)),
  plan: (items: PlanItem[]) => AsyncStorage.setItem(KEYS.plan, JSON.stringify(items)),
  checkins: (c: Record<string, Checkin>) => AsyncStorage.setItem(KEYS.checkins, JSON.stringify(c)),
  badges: (b: Record<string, string>) => AsyncStorage.setItem(KEYS.badges, JSON.stringify(b)),
  stays: (s: Stay[]) => AsyncStorage.setItem(KEYS.stays, JSON.stringify(s)),
};

export type GuestContextValue = GuestState & {
  setLang: (l: Lang) => void;
  setApartment: (slug: string | null) => void;
  setArrival: (iso: string | null) => void;
  setDeparture: (iso: string | null) => void;
  setReminder: (on: boolean) => void;
  toggleChecklist: (index: number) => void;
  /** Fügt Likes/Matches dem Plan hinzu (dedupliziert; Superlike/Match gewinnen). */
  addToPlan: (items: PlanItem[]) => void;
  removeFromPlan: (id: string) => void;
  /** „Waren wir!" — Check-in inkl. eingefrorener Wetterklasse; liefert neue Badges. */
  checkin: (id: string, weather?: Checkin['weather']) => void;
  setBadges: (b: Record<string, string>) => void;
  /** Vergangenen Aufenthalt in die Nächte-Bilanz eintragen. */
  addStay: (stay: Stay) => void;
  resetVacationData: () => void;
};

export const GuestContext = createContext<GuestContextValue>({
  ...emptyState,
  setLang: () => {},
  setApartment: () => {},
  setArrival: () => {},
  setDeparture: () => {},
  setReminder: () => {},
  toggleChecklist: () => {},
  addToPlan: () => {},
  removeFromPlan: () => {},
  checkin: () => {},
  setBadges: () => {},
  addStay: () => {},
  resetVacationData: () => {},
});

export const useGuest = () => useContext(GuestContext);

/** Übersetzungsfunktion + aktive Sprache — der Standard-Hook aller Screens. */
export function useT(): { t: TFn; lang: Lang } {
  const { lang } = useContext(GuestContext);
  return { t: makeT(lang), lang };
}
