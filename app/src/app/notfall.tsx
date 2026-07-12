// Notfall & Praktisches — bundesweite Nummern sofort wählbar, lokale
// Einträge pflegt Iris in guestInfo.ts.
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, isTodo, Muted, Screen, TodoHint } from '../components/ui';
import { content } from '../content';
import { notfall } from '../data/guestInfo';
import { colors, radius, spacing } from '../theme';

export default function Notfall() {
  const { site } = content;
  return (
    <Screen>
      <Card>
        {notfall.map((n) => {
          if (isTodo(n.value)) {
            return (
              <View key={n.title} style={styles.line}>
                <Text style={styles.title}>{n.title}</Text>
                <TodoHint />
              </View>
            );
          }
          return n.tel ? (
            <Pressable
              key={n.title}
              onPress={() => Linking.openURL(`tel:${n.tel}`).catch(() => {})}
              style={({ pressed }) => [styles.callRow, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.callTitle}>{n.title}</Text>
              <Text style={styles.callValue}>📞 {n.value}</Text>
            </Pressable>
          ) : (
            <View key={n.title} style={styles.line}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.value}>{n.value}</Text>
            </View>
          );
        })}
      </Card>
      <Muted>
        Und für alles andere: Iris unter {site.phoneDisplay} — im Zweifel lieber einmal zu viel anrufen.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { paddingVertical: spacing.xs, gap: 2 },
  title: { fontWeight: '600', color: colors.aqua900, fontSize: 15 },
  value: { color: colors.ink700, fontSize: 15 },
  callRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.sand50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginVertical: 2,
    minHeight: 48,
  },
  callTitle: { fontWeight: '600', color: colors.aqua900, fontSize: 15, flex: 1 },
  callValue: { color: colors.aqua700, fontWeight: '700', fontSize: 15 },
});
