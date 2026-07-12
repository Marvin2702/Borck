// WLAN-Karte mit Kopier-Buttons (Clipboard + Haptik) — die meistgestellte
// Gästefrage, deshalb ein eigener, schneller Screen.
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, isTodo, Muted, Screen, SectionTitle, TodoHint } from '../components/ui';
import { apartmentBySlug } from '../content';
import { perApartment } from '../data/guestInfo';
import { useGuest } from '../lib/store';
import { colors, radius, spacing } from '../theme';

function CopyField({ label, value }: { label: string; value: string }) {
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
        <Text style={styles.copyLabel}>{copied ? '✓ Kopiert' : 'Kopieren'}</Text>
      </Pressable>
    </View>
  );
}

export default function Wlan() {
  const { apartment } = useGuest();
  const apt = apartmentBySlug(apartment ?? undefined);
  const wifi = apartment ? perApartment[apartment]?.wifi : undefined;
  const ready = wifi && !isTodo(wifi.ssid) && !isTodo(wifi.password);

  return (
    <Screen>
      <SectionTitle>WLAN in {apt?.name ?? 'deiner Wohnung'}</SectionTitle>
      <Card>
        {ready ? (
          <>
            <CopyField label="Netzwerk (SSID)" value={wifi.ssid} />
            <CopyField label="Passwort" value={wifi.password} />
            <Muted>Passwort kopieren, in den WLAN-Einstellungen einfügen — fertig.</Muted>
          </>
        ) : (
          <>
            <TodoHint />
            <Muted>Die Zugangsdaten findest du auch ausgedruckt in der Wohnung.</Muted>
          </>
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
