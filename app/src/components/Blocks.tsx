// =========================================================================
// Rendert die build-time geparsten Guide-Blöcke (h2/h3/p/li) als natives
// Layout — bewusst kein WebView (Apple 4.2) und kein Runtime-Markdown.
// =========================================================================
import { Linking, StyleSheet, Text, View } from 'react-native';
import type { Block } from '../content';
import { colors, fonts, spacing } from '../theme';

function Spans({ spans }: { spans: Block['spans'] }) {
  return (
    <>
      {spans.map((s, i) =>
        s.href ? (
          <Text key={i} style={styles.link} onPress={() => Linking.openURL(s.href!).catch(() => {})}>
            {s.text}
          </Text>
        ) : (
          <Text key={i} style={s.bold ? styles.bold : undefined}>
            {s.text}
          </Text>
        )
      )}
    </>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) => {
        if (b.t === 'h2' || b.t === 'h3') {
          return (
            <Text key={i} style={b.t === 'h2' ? styles.h2 : styles.h3}>
              <Spans spans={b.spans} />
            </Text>
          );
        }
        if (b.t === 'li') {
          return (
            <View key={i} style={styles.liRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.p}>
                <Spans spans={b.spans} />
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={styles.p}>
            <Spans spans={b.spans} />
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  h2: { fontFamily: fonts.head, fontSize: 22, lineHeight: 28, color: colors.aqua900, marginTop: spacing.sm },
  h3: { fontFamily: fonts.head, fontSize: 18, lineHeight: 24, color: colors.aqua900, marginTop: spacing.xs },
  p: { fontSize: 16, lineHeight: 24, color: colors.ink900, flex: 1 },
  liRow: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
  bullet: { color: colors.aqua500, fontSize: 16, lineHeight: 24 },
  bold: { fontWeight: '700' },
  link: { color: colors.aqua700, textDecorationLine: 'underline' },
});
