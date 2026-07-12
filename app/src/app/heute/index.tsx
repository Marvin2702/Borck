// „Was machen wir heute?" — die Reiseführer der Website, nativ gerendert,
// mit Schietwetter-Filter. Dazu Iris' persönliche Tipps.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, isTodo, Muted, Screen, SectionTitle } from '../../components/ui';
import { content, type Guide } from '../../content';
import { irisTipps } from '../../data/guestInfo';
import { colors, fonts, radius, spacing } from '../../theme';

type Filter = 'alle' | 'draussen' | 'schietwetter';

export const matchesFilter = (g: Guide, f: Filter) =>
  f === 'alle' ? true : f === 'schietwetter' ? g.category !== 'outdoor' : g.category !== 'indoor';

const filters: { key: Filter; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'draussen', label: '☀️ Draußen' },
  { key: 'schietwetter', label: '🌧️ Schietwetter' },
];

export default function Heute() {
  const [filter, setFilter] = useState<Filter>('alle');
  const guides = content.guides.filter((g) => matchesFilter(g, filter));
  const tippsReady = irisTipps.some((t) => !isTodo(t.title));

  return (
    <Screen>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.pill, filter === f.key && styles.pillActive]}
          >
            <Text style={[styles.pillLabel, filter === f.key && styles.pillLabelActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {guides.map((g) => (
        <Pressable
          key={g.slug}
          onPress={() => router.push({ pathname: '/heute/[guide]', params: { guide: g.slug } })}
          style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
        >
          <Card>
            <View style={styles.guideHead}>
              <Text style={styles.guideIcon}>{g.icon}</Text>
              <Text style={styles.guideTitle}>{g.title}</Text>
            </View>
            <Muted>{g.teaser}</Muted>
          </Card>
        </Pressable>
      ))}

      {tippsReady && (
        <>
          <SectionTitle>Iris&apos; Tipps</SectionTitle>
          {irisTipps
            .filter((t) => !isTodo(t.title))
            .map((t) => (
              <Card key={t.title}>
                <Text style={styles.tippTitle}>{t.title}</Text>
                <Body>{t.text}</Body>
              </Card>
            ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.aqua700, borderColor: colors.aqua700 },
  pillLabel: { fontWeight: '600', color: colors.ink700 },
  pillLabelActive: { color: colors.white },
  guideHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  guideIcon: { fontSize: 20 },
  guideTitle: { fontFamily: fonts.head, fontSize: 18, color: colors.aqua900, flex: 1 },
  tippTitle: { fontWeight: '700', color: colors.aqua900, fontSize: 16 },
});
