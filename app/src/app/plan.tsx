// =========================================================================
// Urlaubsplan: die Likes/Matches aus dem Entdecken — mit wetterschlauem
// „Heute passt"-Kopf, Superlike-Pins, Duo-Match-Badges und „Waren wir!".
// =========================================================================
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Confetti } from '../components/Confetti';
import { WeatherPill } from '../components/WeatherPill';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { activityById } from '../content';
import { badgeDefs } from '../data/badges';
import { newBadges } from '../lib/badges';
import { getWeather, todayClass } from '../lib/weather';
import { useGuest } from '../lib/store';
import { colors, fonts, radius, spacing } from '../theme';

export default function Plan() {
  const { plan, checkins, badges, checkin, removeFromPlan } = useGuest();
  const [weather, setWeather] = useState<ReturnType<typeof todayClass>>(null);
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getWeather().then((w) => setWeather(todayClass(w)));
  }, []);

  const open = plan.filter((p) => !checkins[p.id]);
  const done = plan.filter((p) => checkins[p.id]);
  const sorted = [...open].sort(
    (a, b) => Number(b.superlike) - Number(a.superlike) || Number(b.source === 'match') - Number(a.source === 'match')
  );
  // „Heute passt": bei Schietwetter Indoor zuerst, sonst Outdoor.
  const fits = sorted
    .map((p) => activityById(p.id)!)
    .filter((a) => (weather === 'schietwetter' ? a.indoor : weather ? !a.indoor : true))
    .slice(0, 3);

  const doCheckin = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const before = badges;
    checkin(id, weather ?? undefined);
    const fresh = newBadges(before, { ...checkins, [id]: { date: new Date().toISOString(), weather: weather ?? undefined } });
    if (fresh.length > 0) {
      setBurst((b) => b + 1);
      const def = badgeDefs.find((d) => d.id === fresh[0]);
      setToast(def ? `Neuer Stempel: ${def.icon} ${def.title.replace(/!$/, '')}!` : null);
      setTimeout(() => setToast(null), 3200);
    }
  };

  if (plan.length === 0) {
    return (
      <Screen>
        <Text style={styles.empty}>🃏</Text>
        <SectionTitle>Noch keine Ideen im Plan</SectionTitle>
        <Muted>Swipt euch durch Büsum — eure Likes landen hier.</Muted>
        <Pressable onPress={() => router.push('/entdecken')} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaLabel}>Jetzt entdecken</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <Confetti burst={burst} />
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
      <WeatherPill />

      {fits.length > 0 && weather && (
        <>
          <SectionTitle>Heute passt</SectionTitle>
          {fits.map((a) => (
            <Card key={a.id} style={styles.fitCard}>
              <RowContent id={a.id} onCheckin={doCheckin} onRemove={removeFromPlan} plan={plan} />
            </Card>
          ))}
        </>
      )}

      <SectionTitle>Euer Plan ({open.length})</SectionTitle>
      {sorted
        .filter((p) => !fits.some((f) => f.id === p.id))
        .map((p) => (
          <Card key={p.id}>
            <RowContent id={p.id} onCheckin={doCheckin} onRemove={removeFromPlan} plan={plan} />
          </Card>
        ))}

      {done.length > 0 && (
        <>
          <SectionTitle>Schon erlebt ✓</SectionTitle>
          <Muted>
            {done.length} {done.length === 1 ? 'Erlebnis' : 'Erlebnisse'} abgehakt — eure Stempel warten im{' '}
            <Text style={styles.link} onPress={() => router.push('/album')}>
              Sammelalbum →
            </Text>
          </Muted>
        </>
      )}
    </Screen>
  );
}

function RowContent({
  id,
  plan,
  onCheckin,
  onRemove,
}: {
  id: string;
  plan: { id: string; superlike: boolean; source: string }[];
  onCheckin: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const a = activityById(id);
  const item = plan.find((p) => p.id === id);
  if (!a || !item) return null;
  const maps = `https://maps.google.com/?q=${a.lat},${a.lng}`;
  return (
    <>
      <View style={styles.rowHead}>
        <Text style={styles.rowIcon}>{a.icon}</Text>
        <View style={styles.rowTitleWrap}>
          <Text style={styles.rowName}>
            {item.superlike ? '⭐ ' : ''}
            {a.name}
          </Text>
          <Text style={styles.rowMeta}>
            ca. {String(a.km).replace('.', ',')} km · {a.indoor ? 'Indoor' : 'Draußen'}
            {item.source === 'match' ? ' · 💙 Gemeinsam gewählt' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <Pressable onPress={() => onCheckin(id)} style={({ pressed }) => [styles.small, styles.checkBtn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.checkLabel}>✓ Waren wir!</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(a.url).catch(() => {})} style={styles.small}>
          <Text style={styles.smallLabel}>Info ↗</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(maps).catch(() => {})} style={styles.small}>
          <Text style={styles.smallLabel}>Karte</Text>
        </Pressable>
        <Pressable onPress={() => onRemove(id)} style={styles.small} accessibilityLabel="Vom Plan entfernen">
          <Text style={styles.removeLabel}>✕</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 56, textAlign: 'center', marginTop: spacing.xl },
  cta: { backgroundColor: colors.aqua700, borderRadius: radius.pill, padding: spacing.md, alignItems: 'center' },
  ctaLabel: { color: colors.white, fontWeight: '700', fontSize: 16 },
  toast: {
    backgroundColor: colors.aqua900,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  toastText: { color: colors.white, fontWeight: '700', textAlign: 'center' },
  fitCard: { borderWidth: 1.5, borderColor: colors.aqua300 },
  rowHead: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  rowIcon: { fontSize: 28 },
  rowTitleWrap: { flex: 1, gap: 2 },
  rowName: { fontFamily: fonts.head, fontSize: 17, color: colors.aqua900 },
  rowMeta: { fontSize: 12.5, color: colors.ink500 },
  rowActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.sand50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    minHeight: 36,
    justifyContent: 'center',
  },
  checkBtn: { backgroundColor: colors.aqua700, borderColor: colors.aqua700 },
  checkLabel: { color: colors.white, fontWeight: '700', fontSize: 13 },
  smallLabel: { color: colors.ink700, fontWeight: '600', fontSize: 13 },
  removeLabel: { color: colors.ink500, fontSize: 14 },
  link: { color: colors.aqua700, fontWeight: '700' },
});
