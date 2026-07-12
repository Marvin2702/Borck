// Stempel-Optik fürs Sammelalbum: verdient = farbig + Datum, sonst grau + 🔒.
import { StyleSheet, Text, View } from 'react-native';
import type { BadgeDef } from '../data/badges';
import { colors, fonts, spacing } from '../theme';

export function BadgeStamp({ def, earnedAt, index = 0 }: { def: BadgeDef; earnedAt?: string; index?: number }) {
  const rot = ((index * 37) % 13) - 6; // leichte, deterministische Zufallsrotation
  const earned = Boolean(earnedAt);
  return (
    <View style={[styles.stamp, { transform: [{ rotate: `${rot}deg` }] }, !earned && styles.locked]}>
      <Text style={styles.icon}>{earned ? def.icon : '🔒'}</Text>
      <Text style={[styles.title, !earned && styles.mutedText]}>{def.title}</Text>
      <Text style={styles.hint} numberOfLines={2}>
        {earned ? new Date(earnedAt!).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : def.hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.aqua500,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 1,
  },
  locked: { borderColor: colors.sand200, backgroundColor: colors.sand50, opacity: 0.85 },
  icon: { fontSize: 26 },
  title: { fontFamily: fonts.head, fontSize: 12.5, color: colors.aqua900, textAlign: 'center' },
  mutedText: { color: colors.ink500 },
  hint: { fontSize: 8.5, color: colors.ink500, textAlign: 'center' },
});
