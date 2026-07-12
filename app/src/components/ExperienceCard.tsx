// =========================================================================
// Swipe-Karten ohne Fotos: Mood-Akzentfläche, Riesen-Emoji + Wasserzeichen,
// Chips für Distanz/Indoor. MoodCard = große Karte der Stimmungs-Runde.
// Foto-Slot ist vorbereitet (Iris kann später echte Bilder nachliefern).
// =========================================================================
import { StyleSheet, Text, View } from 'react-native';
import type { Activity, Mood } from '../content';
import { colors, fonts, radius, spacing } from '../theme';

/** Ruhige Akzentflächen je Mood (Töne aus dem Website-Farbsystem). */
export const moodTint: Record<string, string> = {
  wasser: '#dcebf2',
  watt: '#e3ecdf',
  action: '#f6e7d4',
  kultur: '#ece4f0',
  wellness: '#dff0ee',
  strand: '#fdeed3',
};

function CardShell({ tint, icon, children }: { tint: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={[styles.card, { backgroundColor: tint }]}>
      <Text style={styles.watermark}>{icon}</Text>
      {children}
    </View>
  );
}

export function ActivityCard({ activity, ribbon }: { activity: Activity; ribbon?: string }) {
  const tint = moodTint[activity.mood[0]] ?? colors.aqua100;
  const km = String(activity.km).replace('.', ',');
  return (
    <CardShell tint={tint} icon={activity.icon}>
      {ribbon ? (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{ribbon}</Text>
        </View>
      ) : null}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{activity.icon}</Text>
      </View>
      <Text style={styles.name}>{activity.name}</Text>
      <View style={styles.chips}>
        <Text style={styles.chip}>ca. {km} km</Text>
        <Text style={styles.chip}>{activity.indoor ? 'Indoor 🏠' : 'Draußen 🌤️'}</Text>
        <Text style={styles.chip}>{activity.area}</Text>
      </View>
      <Text style={styles.desc}>{activity.description}</Text>
    </CardShell>
  );
}

export function MoodCard({ mood }: { mood: Mood }) {
  const tint = moodTint[mood.id] ?? colors.aqua100;
  return (
    <CardShell tint={tint} icon={mood.icon}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{mood.icon}</Text>
      </View>
      <Text style={styles.name}>{mood.label}</Text>
      <Text style={styles.desc}>{mood.teaser}</Text>
      <Text style={styles.moodHint}>Klingt das nach eurem Urlaub?</Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  watermark: {
    position: 'absolute',
    top: -30,
    right: -34,
    fontSize: 190,
    opacity: 0.08,
    transform: [{ rotate: '-8deg' }],
  },
  ribbon: {
    position: 'absolute',
    top: 18,
    left: 0,
    backgroundColor: colors.aqua900,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  ribbonText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 64 },
  name: { fontFamily: fonts.head, fontSize: 27, lineHeight: 33, color: colors.aqua900 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink700,
    overflow: 'hidden',
  },
  desc: { fontSize: 15, lineHeight: 22, color: colors.ink700 },
  moodHint: { fontSize: 13, color: colors.ink500, fontStyle: 'italic' },
});
