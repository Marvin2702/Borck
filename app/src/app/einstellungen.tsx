// Einstellungen: Wohnung wechseln, rechtliche Links, App-Info.
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { apartmentBySlug, content } from '../content';
import { cancelCheckoutReminder } from '../lib/notifications';
import { useGuest } from '../lib/store';
import { colors, radius, spacing } from '../theme';

export default function Einstellungen() {
  const { apartment, setApartment, setDeparture, setReminder, resetVacationData } = useGuest();
  const apt = apartmentBySlug(apartment ?? undefined);
  const { site } = content;

  const resetApartment = async () => {
    await cancelCheckoutReminder();
    setReminder(false);
    setDeparture(null);
    setApartment(null);
    router.replace('/');
  };

  return (
    <Screen>
      <SectionTitle>Deine Wohnung</SectionTitle>
      <Card>
        <Muted>Aktuell gewählt: {apt ? apt.name : 'keine'}</Muted>
        <Pressable onPress={resetApartment} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnLabel}>Wohnung wechseln</Text>
        </Pressable>
      </Card>

      <SectionTitle>Rechtliches</SectionTitle>
      <Card>
        {[
          { label: 'Impressum', url: `${site.websiteUrl}/impressum/` },
          { label: 'Datenschutz', url: `${site.websiteUrl}/datenschutz/` },
          { label: 'Website: Haus Aquamarin', url: site.websiteUrl },
        ].map((l) => (
          <Pressable key={l.label} onPress={() => Linking.openURL(l.url).catch(() => {})} style={styles.linkRow}>
            <Text style={styles.link}>{l.label} ↗</Text>
          </Pressable>
        ))}
      </Card>

      <SectionTitle>Urlaubsdaten</SectionTitle>
      <Card>
        <Muted>Löscht Urlaubsplan, Stempel und angefangene Swipe-Runden (z. B. für den nächsten Aufenthalt).</Muted>
        <Pressable onPress={resetVacationData} style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnLabel}>Urlaubsdaten zurücksetzen</Text>
        </Pressable>
      </Card>

      <Muted>
        Diese App speichert eure Auswahl (Wohnung, Plan, Stempel) nur lokal auf dem Gerät — keine Konten, kein
        Tracking. Fürs Wetter fragt sie anonym die freie Open-Meteo-Vorhersage für Büsum ab.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.aqua700,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnLabel: { color: colors.white, fontWeight: '600' },
  btnDanger: { backgroundColor: '#a64b50' },
  linkRow: { paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center' },
  link: { color: colors.aqua700, fontWeight: '600', fontSize: 15 },
});
