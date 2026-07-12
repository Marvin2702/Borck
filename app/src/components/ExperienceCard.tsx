// =========================================================================
// Swipe-Karten mit Premium-Illustrationen (Nordsee-Travel-Poster-Serie aus
// scripts/generate-activity-art.mjs): vollflächiges Motiv, unten Scrim-
// Verlauf für lesbare Typo. Fällt ohne Map-Eintrag aufs bisherige Design
// zurück (Mood-Tintfläche + Emoji-Wasserzeichen) — so kann jedes Motiv
// später einzeln durch ein echtes Foto ersetzt werden.
// =========================================================================
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Activity, Mood } from '../content';
import { activityArt, cardScrim } from '../data/activityArt';
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

function CardShell({
  tint,
  icon,
  art,
  children,
}: {
  tint: string;
  icon: string;
  art?: number;
  children: React.ReactNode;
}) {
  if (art != null) {
    return (
      <View style={styles.card}>
        {/* explizit 100 %×100 % — ImageBackground füllt in RN 0.86/Web nicht zuverlässig */}
        <Image source={art} style={styles.artFill} resizeMode="cover" />
        <Image source={cardScrim} style={styles.scrim} resizeMode="stretch" />
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.card, { backgroundColor: tint }]}>
      <Text style={styles.watermark}>{icon}</Text>
      {children}
    </View>
  );
}

export function ActivityCard({
  activity,
  ribbon,
  ribbonTone = 'aqua',
}: {
  activity: Activity;
  ribbon?: string;
  ribbonTone?: 'aqua' | 'gold';
}) {
  const art = activityArt[activity.id];
  const onArt = art != null;
  const tint = moodTint[activity.mood[0]] ?? colors.aqua100;
  const km = String(activity.km).replace('.', ',');
  return (
    <CardShell tint={tint} icon={activity.icon} art={art}>
      {ribbon ? (
        <View style={[styles.ribbon, ribbonTone === 'gold' && styles.ribbonGold]}>
          <Text style={[styles.ribbonText, ribbonTone === 'gold' && styles.ribbonTextGold]}>{ribbon}</Text>
        </View>
      ) : null}
      {!onArt && (
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{activity.icon}</Text>
        </View>
      )}
      <Text style={[styles.name, onArt && styles.nameOnArt]}>{activity.name}</Text>
      <View style={styles.chips}>
        <Text style={styles.chip}>ca. {km} km</Text>
        <Text style={styles.chip}>{activity.indoor ? 'Indoor 🏠' : 'Draußen 🌤️'}</Text>
        <Text style={styles.chip}>{activity.area}</Text>
      </View>
      <Text style={[styles.desc, onArt && styles.descOnArt]}>{activity.description}</Text>
    </CardShell>
  );
}

export function MoodCard({ mood }: { mood: Mood }) {
  const art = activityArt[`mood-${mood.id}`];
  const onArt = art != null;
  const tint = moodTint[mood.id] ?? colors.aqua100;
  return (
    <CardShell tint={tint} icon={mood.icon} art={art}>
      {!onArt && (
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{mood.icon}</Text>
        </View>
      )}
      <Text style={[styles.name, onArt && styles.nameOnArt]}>{mood.label}</Text>
      <Text style={[styles.desc, onArt && styles.descOnArt]}>{mood.teaser}</Text>
      <Text style={[styles.moodHint, onArt && styles.moodHintOnArt]}>Klingt das nach eurem Urlaub?</Text>
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
  artFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
    width: '100%',
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
  ribbonGold: { backgroundColor: colors.gold },
  ribbonTextGold: { color: colors.ink900 },
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
  nameOnArt: {
    color: colors.white,
    textShadowColor: 'rgba(13, 59, 68, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
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
  descOnArt: {
    color: '#eaf4f4',
    textShadowColor: 'rgba(13, 59, 68, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  moodHint: { fontSize: 13, color: colors.ink500, fontStyle: 'italic' },
  moodHintOnArt: { color: 'rgba(255,255,255,0.75)' },
});
