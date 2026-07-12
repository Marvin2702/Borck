// =========================================================================
// Root-Layout: lädt Fraunces, stellt den Gast-Zustand (Context) bereit und
// konfiguriert den Stack im Website-Look. Deep Links (hausaquamarin://wohnung/
// {slug} bzw. https://…/gast/{slug}) routet Expo Router automatisch.
// =========================================================================
import { Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { evaluateBadges } from '../lib/badges';
import { saveSession } from '../lib/discover';
import { nights, type Stay } from '../lib/stays';
import { colors, fonts } from '../theme';
import {
  emptyState,
  GuestContext,
  loadState,
  persist,
  type Checkin,
  type GuestState,
  type PlanItem,
} from '../lib/store';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold });
  const [state, setState] = useState<GuestState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setHydrated(true);
    });
  }, []);

  const setApartment = useCallback((slug: string | null) => {
    setState((s) => ({ ...s, apartment: slug }));
    persist.apartment(slug);
  }, []);
  const setArrival = useCallback((iso: string | null) => {
    setState((s) => ({ ...s, arrival: iso }));
    persist.arrival(iso);
  }, []);
  const setDeparture = useCallback((iso: string | null) => {
    setState((s) => ({ ...s, departure: iso }));
    persist.departure(iso);
  }, []);
  const setReminder = useCallback((on: boolean) => {
    setState((s) => ({ ...s, reminder: on }));
    persist.reminder(on);
  }, []);
  const toggleChecklist = useCallback((index: number) => {
    setState((s) => {
      const checklist = s.checklist.includes(index)
        ? s.checklist.filter((i) => i !== index)
        : [...s.checklist, index];
      persist.checklist(checklist);
      return { ...s, checklist };
    });
  }, []);

  const addToPlan = useCallback((items: PlanItem[]) => {
    setState((s) => {
      const byId = new Map(s.plan.map((p) => [p.id, p]));
      for (const item of items) {
        const prev = byId.get(item.id);
        byId.set(item.id, {
          ...item,
          // Match/Superlike „gewinnen" gegenüber einem früheren Solo-Like.
          source: prev?.source === 'match' ? 'match' : item.source,
          superlike: Boolean(prev?.superlike) || item.superlike,
          addedAt: prev?.addedAt ?? item.addedAt,
        });
      }
      const plan = [...byId.values()];
      persist.plan(plan);
      return { ...s, plan };
    });
  }, []);

  const removeFromPlan = useCallback((id: string) => {
    setState((s) => {
      const plan = s.plan.filter((p) => p.id !== id);
      persist.plan(plan);
      return { ...s, plan };
    });
  }, []);

  const checkin = useCallback((id: string, weather?: Checkin['weather']) => {
    setState((s) => {
      const checkins = { ...s.checkins, [id]: { date: new Date().toISOString(), weather } };
      const earned = evaluateBadges(checkins);
      const badges = { ...s.badges };
      for (const b of earned) if (!(b in badges)) badges[b] = new Date().toISOString();
      persist.checkins(checkins);
      persist.badges(badges);
      return { ...s, checkins, badges };
    });
  }, []);

  const setBadges = useCallback((badges: Record<string, string>) => {
    setState((s) => {
      persist.badges(badges);
      return { ...s, badges };
    });
  }, []);

  const addStay = useCallback((stay: Stay) => {
    setState((s) => {
      if (nights(stay.from, stay.to) <= 0) return s;
      // idempotent: gleicher Zeitraum wird nicht doppelt gezählt
      if (s.stays.some((x) => x.from === stay.from && x.to === stay.to)) return s;
      const stays = [...s.stays, stay].sort((a, b) => a.from.localeCompare(b.from));
      persist.stays(stays);
      return { ...s, stays };
    });
  }, []);

  const resetVacationData = useCallback(() => {
    setState((s) => {
      // Laufenden Aufenthalt in die Nächte-Bilanz übernehmen, dann aufräumen.
      // Badges und Bilanz bleiben — das sind die Meilensteine über Jahre.
      let stays = s.stays;
      if (s.arrival && s.departure && nights(s.arrival, s.departure) > 0) {
        if (!stays.some((x) => x.from === s.arrival && x.to === s.departure)) {
          stays = [...stays, { from: s.arrival, to: s.departure }].sort((a, b) => a.from.localeCompare(b.from));
          persist.stays(stays);
        }
      }
      persist.plan([]);
      persist.checkins({});
      persist.checklist([]);
      persist.arrival(null);
      persist.departure(null);
      saveSession(null);
      return { ...s, stays, plan: [], checkins: {}, checklist: [], arrival: null, departure: null };
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setApartment,
      setArrival,
      setDeparture,
      setReminder,
      toggleChecklist,
      addToPlan,
      removeFromPlan,
      checkin,
      setBadges,
      addStay,
      resetVacationData,
    }),
    [state, setApartment, setArrival, setDeparture, setReminder, toggleChecklist, addToPlan, removeFromPlan, checkin, setBadges, addStay, resetVacationData]
  );

  // Splash bleibt, bis Font + Zustand da sind (beides lokal, <100 ms).
  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GuestContext.Provider value={value}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.sand50 },
          headerTintColor: colors.aqua900,
          headerTitleStyle: { fontFamily: fonts.head, fontSize: 19 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.sand50 },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Haus Aquamarin' }} />
        <Stack.Screen name="wohnung/[slug]" options={{ title: '' }} />
        <Stack.Screen name="checkin" options={{ title: 'Anreise & Check-in' }} />
        <Stack.Screen name="wlan" options={{ title: 'WLAN' }} />
        <Stack.Screen name="mappe" options={{ title: 'Gästemappe' }} />
        <Stack.Screen name="heute/index" options={{ title: 'Was machen wir heute?' }} />
        <Stack.Screen name="heute/[guide]" options={{ title: '' }} />
        <Stack.Screen name="gezeiten" options={{ title: 'Ebbe & Flut' }} />
        <Stack.Screen name="notfall" options={{ title: 'Notfall & Praktisches' }} />
        <Stack.Screen name="abreise" options={{ title: 'Abreise' }} />
        <Stack.Screen name="einstellungen" options={{ title: 'Einstellungen' }} />
        <Stack.Screen name="entdecken/index" options={{ title: 'Entdecken' }} />
        <Stack.Screen name="entdecken/swipe" options={{ title: 'Entdecken' }} />
        <Stack.Screen name="plan" options={{ title: 'Euer Urlaubsplan' }} />
        <Stack.Screen name="album" options={{ title: 'Sammelalbum' }} />
        <Stack.Screen name="meilensteine" options={{ title: 'Eure Meilensteine' }} />
        <Stack.Screen name="service" options={{ title: 'Service & Wünsche' }} />
      </Stack>
      </GuestContext.Provider>
    </GestureHandlerRootView>
  );
}
