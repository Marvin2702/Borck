// =========================================================================
// Wetter für „Heute passt" & Deck-Gewichtung: Open-Meteo (kostenlos, ohne
// Key, keine personenbezogenen Daten). Stale-while-revalidate mit 3-h-Cache;
// offline degradiert alles sanft (nie ein Fehler-Screen).
// =========================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { content } from '../content';
import type { WeatherClass } from './discover';

export type WeatherDay = {
  date: string; // YYYY-MM-DD
  code: number; // WMO weather code
  tmax: number;
  precipProb: number;
  windMax: number; // km/h
};

export type WeatherState = { fetchedAt: string; daily: WeatherDay[]; stale: boolean };

const KEY = 'gast.weather';
const TTL_MS = 3 * 60 * 60 * 1000;

/** Büsum-Klassifikation: Wind zählt genauso wie Regen. */
export function classify(day: WeatherDay): WeatherClass {
  if (day.code >= 51 || day.precipProb >= 60 || day.windMax >= 40) return 'schietwetter';
  if (day.code <= 1) return 'sonne';
  return 'wolken';
}

export const weatherEmoji: Record<WeatherClass, string> = {
  sonne: '☀️',
  wolken: '⛅',
  schietwetter: '🌧️',
};

function apiUrl(): string {
  const { lat, lng } = content.site.geo;
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=Europe%2FBerlin&forecast_days=3`
  );
}

export function parseOpenMeteo(json: unknown): WeatherDay[] {
  const d = (json as { daily?: Record<string, unknown[]> }).daily;
  if (!d || !Array.isArray(d.time)) return [];
  return (d.time as string[]).map((date, i) => ({
    date,
    code: Number((d.weather_code as number[])?.[i] ?? 0),
    tmax: Math.round(Number((d.temperature_2m_max as number[])?.[i] ?? 0)),
    precipProb: Number((d.precipitation_probability_max as number[])?.[i] ?? 0),
    windMax: Math.round(Number((d.wind_speed_10m_max as number[])?.[i] ?? 0)),
  }));
}

async function readCache(): Promise<WeatherState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...(JSON.parse(raw) as WeatherState), stale: false } : null;
  } catch {
    return null;
  }
}

/** Liefert sofort Cache (falls da) und aktualisiert bei Bedarf im Hintergrund.
 *  Rückgabe null = noch nie erfolgreich geladen UND offline. */
export async function getWeather(): Promise<WeatherState | null> {
  const cached = await readCache();
  const fresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < TTL_MS;
  if (cached && fresh) return cached;
  try {
    const res = await fetch(apiUrl());
    if (!res.ok) throw new Error(String(res.status));
    const daily = parseOpenMeteo(await res.json());
    if (!daily.length) throw new Error('leer');
    const state: WeatherState = { fetchedAt: new Date().toISOString(), daily, stale: false };
    void AsyncStorage.setItem(KEY, JSON.stringify({ ...state, stale: undefined }));
    return state;
  } catch {
    return cached ? { ...cached, stale: true } : null;
  }
}

export function todayClass(w: WeatherState | null): WeatherClass | null {
  const today = w?.daily?.[0];
  return today ? classify(today) : null;
}
