// WLAN-Karte mit Kopier-Buttons (Clipboard + Haptik) — die meistgestellte
// Gästefrage, deshalb ein eigener, schneller Screen.
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, GermanContentHint, isTodo, Muted, Screen, SectionTitle, TodoHint } from '../components/ui';
import { apartmentBySlug } from '../content';
import { perApartment } from '../data/guestInfo';
import { useGuest, useT } from '../lib/store';
import { colors, radius, spacing } from '../theme';

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <View style={styles.field}>
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue} selectable>
          {value}
        </Text>
      </View>
      <Pressable onPress={copy} style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.8 }]}>
        <Text style={styles.copyLabel}>{copied ? t('common.copied') : t('common.copy')}</Text>
      </Pressable>
    </View>
  );
}

export default function Wlan() {
  const { apartment } = useGuest();
  const { t } = useT();
  const apt = apartmentBySlug(apartment ?? undefined);
  const wifi = apartment ? perApartment[apartment]?.wifi : undefined;
  const publicWifi =
    wifi?.mode === 'public-guest' &&
    wifi.ssid.trim().length > 0 &&
    wifi.password.trim().length > 0 &&
    !isTodo(wifi.ssid) &&
    !isTodo(wifi.password)
      ? wifi
      : undefined;

  return (
    <Screen>
      <SectionTitle>{t('wifi.in', { name: apt?.name ?? t('wifi.yourApt') })}</SectionTitle>
      <Card>
        {wifi?.mode === 'onsite' ? (
          <>
            <Body>{wifi.accessHint}</Body>
            <Muted>{t('wifi.onsiteNote')}</Muted>
            <GermanContentHint />
          </>
        ) : publicWifi ? (
          <>
            <CopyField label={t('wifi.ssid')} value={publicWifi.ssid} />
            <CopyField label={t('wifi.password')} value={publicWifi.password} />
            <Muted>{t('wifi.copyNote')}</Muted>
          </>
        ) : wifi?.mode === 'public-guest' ? (
          <>
            <TodoHint />
            <Muted>{t('wifi.printed')}</Muted>
          </>
        ) : (
          <Muted>{t('wifi.chooseFirst')}</Muted>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.sand50,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  fieldText: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 12, color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.6 },
  fieldValue: { fontSize: 17, fontWeight: '600', color: colors.ink900 },
  copyBtn: {
    backgroundColor: colors.aqua700,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  copyLabel: { color: colors.white, fontWeight: '600' },
});
