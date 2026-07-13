// Einstellungen: Wohnung wechseln, rechtliche Links, App-Info.
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { LanguagePills } from '../components/LanguagePills';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { apartmentBySlug, content } from '../content';
import { cancelCheckoutReminder } from '../lib/notifications';
import { useGuest, useT } from '../lib/store';
import { colors, radius, spacing } from '../theme';

export default function Einstellungen() {
  const { apartment, setApartment, setDeparture, setReminder, resetVacationData } = useGuest();
  const { t } = useT();
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
      <SectionTitle>{t('settings.apartment')}</SectionTitle>
      <Card>
        <Muted>{t('settings.current', { name: apt ? apt.name : t('common.none') })}</Muted>
        <Pressable onPress={resetApartment} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnLabel}>{t('settings.switch')}</Text>
        </Pressable>
      </Card>

      <SectionTitle>{t('settings.language')}</SectionTitle>
      <Card>
        <LanguagePills />
        <Muted>{t('settings.languageNote')}</Muted>
      </Card>

      <SectionTitle>{t('settings.legal')}</SectionTitle>
      <Card>
        {[
          { label: t('settings.imprint'), url: `${site.websiteUrl}/impressum/` },
          { label: t('settings.privacy'), url: `${site.websiteUrl}/datenschutz/` },
          { label: t('settings.website'), url: site.websiteUrl },
        ].map((l) => (
          <Pressable key={l.label} onPress={() => Linking.openURL(l.url).catch(() => {})} style={styles.linkRow}>
            <Text style={styles.link}>{l.label} ↗</Text>
          </Pressable>
        ))}
      </Card>

      <SectionTitle>{t('settings.vacation')}</SectionTitle>
      <Card>
        <Muted>{t('settings.resetInfo')}</Muted>
        <Pressable onPress={resetVacationData} style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnLabel}>{t('settings.reset')}</Text>
        </Pressable>
      </Card>

      <Muted>{t('settings.privacyNote')}</Muted>
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
