// =========================================================================
// Kleine UI-Bausteine im Website-Look (Sand-Flächen, Aqua-Töne, Gold-Akzent):
// Screen-Scroller, Karten, Sektionstitel, Zeilen, Quick-Actions mit Haptik.
// =========================================================================
import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useT } from '../lib/store';
import { colors, fonts, radius, spacing } from '../theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenInner} contentInsetAdjustmentBehavior="automatic">
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Muted({ children }: PropsWithChildren) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}

/** Kennzeichnet noch nicht gepflegte Inhalte (TODO-Platzhalter aus guestInfo). */
export const isTodo = (s: string) => /\bTODO\s*:/i.test(s);
export function TodoHint() {
  const { t } = useT();
  return <Text style={styles.todo}>{t('common.todoHint')}</Text>;
}

/** Hinweis für nicht-deutsche Gäste: Iris-gepflegte Inhalte sind Deutsch. */
export function GermanContentHint() {
  const { t, lang } = useT();
  if (lang === 'de') return null;
  return <Text style={styles.todo}>{t('common.germanContent')}</Text>;
}

export function Row({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

type ActionProps = { label: string; icon: string; url: string; accent?: string };

/** Quick-Action (WhatsApp/Anruf/Route/Link) — öffnet extern, mit Haptik. */
export function Action({ label, icon, url, accent }: ActionProps) {
  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(url).catch(() => {});
  };
  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [styles.action, accent ? { backgroundColor: accent } : null, pressed && styles.pressed]}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export function ActionRow({ children }: PropsWithChildren) {
  return <View style={styles.actionRow}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand50 },
  screenInner: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { fontFamily: fonts.head, fontSize: 22, color: colors.aqua900, marginTop: spacing.sm },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink900 },
  muted: { fontSize: 14, lineHeight: 21, color: colors.ink500 },
  todo: { fontSize: 14, lineHeight: 21, color: colors.gold700, fontStyle: 'italic' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.aqua900, flexShrink: 0 },
  rowValue: { fontSize: 15, color: colors.ink700, flex: 1, textAlign: 'right' },
  action: {
    flex: 1,
    backgroundColor: colors.aqua700,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    gap: 2,
    minHeight: 56,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  actionIcon: { fontSize: 18 },
  actionLabel: { color: colors.white, fontWeight: '600', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
});
