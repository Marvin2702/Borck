// Kompakte Wetterzeile („Heute: 17° ⛅ · Wind 25 km/h") mit Stale-Hinweis.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { classify, getWeather, weatherEmoji, type WeatherState } from '../lib/weather';
import { colors, radius, spacing } from '../theme';

export function WeatherPill() {
  const [w, setW] = useState<WeatherState | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getWeather().then((res) => alive && setW(res));
    return () => {
      alive = false;
    };
  }, []);

  if (!w) return null; // lädt noch oder nie geladen+offline → still degradieren
  const today = w.daily[0];
  const cls = classify(today);
  const label = cls === 'schietwetter' ? 'Schietwetter' : cls === 'sonne' ? 'Sonne satt' : 'Wechselhaft';
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>
        Heute: {today.tmax}° {weatherEmoji[cls]} {label} · Wind {today.windMax} km/h
        {w.stale ? ' · (älterer Stand)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
});
