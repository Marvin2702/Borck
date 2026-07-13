// Digitale Gästemappe — komplett offline, Sektionen aus guestInfo.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, GermanContentHint, isTodo, Muted, Screen, TodoHint } from '../components/ui';
import { gaestemappe } from '../data/guestInfo';
import { useT } from '../lib/store';
import { colors, fonts, spacing } from '../theme';

export default function Mappe() {
  const { t } = useT();
  return (
    <Screen>
      <Muted>{t('mappe.intro')}</Muted>
      <GermanContentHint />
      {gaestemappe.map((sec) => (
        <Card key={sec.title}>
          <View style={styles.head}>
            <Text style={styles.icon}>{sec.icon}</Text>
            <Text style={styles.title}>{sec.title}</Text>
          </View>
          {sec.lines.map((line, i) => (isTodo(line) ? <TodoHint key={i} /> : <Body key={i}>{line}</Body>))}
        </Card>
      ))}
      <Pressable onPress={() => router.push('/service')}>
        <Card style={styles.serviceLink}>
          <Text style={styles.serviceText}>{t('mappe.serviceLink')}</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 20 },
  title: { fontFamily: fonts.head, fontSize: 19, color: colors.aqua900 },
  serviceLink: { backgroundColor: colors.aqua100 },
  serviceText: { fontWeight: '700', color: colors.aqua900 },
});
