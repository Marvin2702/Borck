// =========================================================================
// Root-Layout: lädt Fraunces, stellt den Gast-Zustand (Context) bereit und
// konfiguriert den Stack im Website-Look. Deep Links (hausaquamarin://wohnung/
// {slug} bzw. https://…/gast/{slug}) routet Expo Router automatisch.
// =========================================================================
import { Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, fonts } from '../theme';
import {
  emptyState,
  GuestContext,
  loadState,
  persist,
  type GuestState,
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

  const value = useMemo(
    () => ({ ...state, setApartment, setDeparture, setReminder, toggleChecklist }),
    [state, setApartment, setDeparture, setReminder, toggleChecklist]
  );

  // Splash bleibt, bis Font + Zustand da sind (beides lokal, <100 ms).
  if (!fontsLoaded || !hydrated) return null;

  return (
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
      </Stack>
    </GuestContext.Provider>
  );
}
