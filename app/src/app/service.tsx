// =========================================================================
// Service & Wünsche: 2-Tap-Anfragen an Iris als vorbefüllte WhatsApp-
// Nachrichten (Fallback mailto). „Kein Callcenter — einfach Iris."
// =========================================================================
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { apartmentBySlug, content } from '../content';
import { serviceRequests } from '../data/services';
import { useGuest } from '../lib/store';
import { colors, fonts, radius, spacing } from '../theme';

export default function Service() {
  const { apartment } = useGuest();
  const apt = apartmentBySlug(apartment ?? undefined);
  const { site } = content;
  const wohnung = apt ? `der Wohnung ${apt.name}` : 'einer eurer Wohnungen';

  const send = async (template: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const text = template.replaceAll('{wohnung}', wohnung);
    const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
    try {
      await Linking.openURL(wa);
    } catch {
      const mail = `mailto:${site.email}?subject=${encodeURIComponent('Anfrage aus der Gäste-App')}&body=${encodeURIComponent(text)}`;
      Linking.openURL(mail).catch(() => {});
    }
  };

  return (
    <Screen>
      <Muted>Zwei Tipper, und Iris weiß Bescheid — die Nachricht ist schon vorgeschrieben, du kannst sie noch anpassen.</Muted>
      {serviceRequests.map((s) => (
        <Pressable key={s.id} onPress={() => send(s.template)} style={({ pressed }) => pressed && { opacity: 0.9 }}>
          <Card>
            <View style={styles.row}>
              <Text style={styles.icon}>{s.icon}</Text>
              <View style={styles.textWrap}>
                <Text style={styles.label}>{s.label}</Text>
                <Muted>{s.hint}</Muted>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        </Pressable>
      ))}

      <SectionTitle>Alles andere</SectionTitle>
      <View style={styles.contactRow}>
        <Pressable
          onPress={() => Linking.openURL(`https://wa.me/${site.whatsapp}`).catch(() => {})}
          style={({ pressed }) => [styles.contactBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.contactLabel}>💬 WhatsApp</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`tel:${site.phone}`).catch(() => {})}
          style={({ pressed }) => [styles.contactBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.contactLabel}>📞 {site.phoneDisplay}</Text>
        </Pressable>
      </View>
      <Muted>Kein Callcenter — am anderen Ende ist Iris. Schlüssel-Infos findet ihr unter{' '}
        <Text style={styles.link} onPress={() => router.push('/checkin')}>Anreise & Check-in</Text>.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 26 },
  textWrap: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.head, fontSize: 17, color: colors.aqua900 },
  chevron: { fontSize: 26, color: colors.ink500 },
  contactRow: { flexDirection: 'row', gap: spacing.sm },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.aqua700,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  contactLabel: { color: colors.white, fontWeight: '700' },
  link: { color: colors.aqua700, fontWeight: '700' },
});
