// Sammelalbum: verdiente Stempel + Vorschau auf die noch offenen.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeStamp } from '../components/BadgeStamp';
import { Muted, Screen, SectionTitle } from '../components/ui';
import { badgeDefs } from '../data/badges';
import { useGuest } from '../lib/store';
import { colors, radius, spacing } from '../theme';

export default function Album() {
  const { badges, checkins } = useGuest();
  const earnedCount = Object.keys(badges).length;
  const doneCount = Object.keys(checkins).length;

  return (
    <Screen>
      <Muted>
        {doneCount === 0
          ? 'Hakt Erlebnisse im Urlaubsplan ab („Waren wir!") — hier wächst euer Urlaub in Stempeln.'
          : `${doneCount} ${doneCount === 1 ? 'Erlebnis' : 'Erlebnisse'} erlebt · ${earnedCount} von ${badgeDefs.length} Stempeln`}
      </Muted>
      <View style={styles.grid}>
        {badgeDefs.map((def, i) => (
          <BadgeStamp key={def.id} def={def} earnedAt={badges[def.id]} index={i} />
        ))}
      </View>
      {doneCount === 0 && (
        <Pressable onPress={() => router.push('/entdecken')} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaLabel}>Erlebnisse entdecken</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  cta: { backgroundColor: colors.aqua700, borderRadius: radius.pill, padding: spacing.md, alignItems: 'center' },
  ctaLabel: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
