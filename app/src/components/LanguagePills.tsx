// Sprachwahl als Pill-Reihe — auf dem Startscreen und in den Einstellungen.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { languages, type Lang } from '../i18n';
import { useGuest } from '../lib/store';
import { colors, radius, spacing } from '../theme';

const FLAGS: Record<Lang, string> = { de: '🇩🇪', en: '🇬🇧', nl: '🇳🇱', da: '🇩🇰' };

export function LanguagePills({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useGuest();
  return (
    <View style={styles.row}>
      {(Object.keys(languages) as Lang[]).map((l) => {
        const active = l === lang;
        return (
          <Pressable
            key={l}
            accessibilityLabel={languages[l]}
            onPress={() => setLang(l)}
            style={({ pressed }) => [styles.pill, active && styles.active, pressed && { opacity: 0.85 }]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {FLAGS[l]}
              {compact ? '' : ` ${languages[l]}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.aqua700, borderColor: colors.aqua700 },
  label: { fontWeight: '600', color: colors.ink700, fontSize: 14 },
  labelActive: { color: colors.white },
});
