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
} as const;

export type GuestState = {
  apartment: string | null;
  departure: string | null;
  reminder: boolean;
  checklist: number[];
};

export const emptyState: GuestState = { apartment: null, departure: null, reminder: false, checklist: [] };

export async function loadState(): Promise<GuestState> {
  try {
    const [apartment, departure, reminder, checklist] = await AsyncStorage.multiGet(Object.values(KEYS)).then((e) =>
      e.map(([, v]) => v)
    );
    return {
      apartment: apartment || null,
      departure: departure || null,
      reminder: reminder === '1',
      checklist: checklist ? (JSON.parse(checklist) as number[]) : [],
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
};

export type GuestContextValue = GuestState & {
  setApartment: (slug: string | null) => void;
  setDeparture: (iso: string | null) => void;
  setReminder: (on: boolean) => void;
  toggleChecklist: (index: number) => void;
};

export const GuestContext = createContext<GuestContextValue>({
  ...emptyState,
  setApartment: () => {},
  setDeparture: () => {},
  setReminder: () => {},
  toggleChecklist: () => {},
});

export const useGuest = () => useContext(GuestContext);
