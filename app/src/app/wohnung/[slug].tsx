// =========================================================================
// Wohnungs-Home: Hero mit Akzentfarbe, Quick-Actions (WhatsApp/Anruf/Route),
// Kachel-Navigation zu allen Bereichen. Deep-Link-Ziel des QR-Codes.
// =========================================================================
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Action, ActionRow, Muted, Screen } from '../../components/ui';
import { WeatherPill } from '../../components/WeatherPill';
import { apartmentBySlug, content } from '../../content';
import { heroImages } from '../../heroImages';
import { useGuest } from '../../lib/store';
import { colors, fonts, radius, spacing } from '../../theme';

const tiles = [
  { href: '/checkin', icon: '🔑', label: 'Anreise & Check-in' },
  { href: '/wlan', icon: '📶', label: 'WLAN' },
  { href: '/mappe', icon: '📖', label: 'Gästemappe' },
  { href: '/service', icon: '🛎️', label: 'Service & Wünsche' },
  { href: '/heute', icon: '📘', label: 'Reisetipps zum Lesen' },
  { href: '/gezeiten', icon: '🌙', label: 'Ebbe & Flut' },
  { href: '/album', icon: '🎖️', label: 'Sammelalbum' },
  { href: '/notfall', icon: '⛑️', label: 'Notfall & Praktisches' },
  { href: '/abreise', icon: '👋', label: 'Abreise' },
  { href: '/einstellungen', icon: '⚙️', label: 'Einstellungen' },
] as const;

export default function ApartmentHome() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { apartment, setApartment, plan } = useGuest();
  const apt = apartmentBySlug(slug);

  // Deep-Link merken: QR gescannt => diese Wohnung wird die gespeicherte.
  useEffect(() => {
    if (apt && apartment !== apt.slug) setApartment(apt.slug);
  }, [apt, apartment, setApartment]);

  if (!apt) return <Redirect href="/" />;

  const { site } = content;
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Moin Iris! Wir sind in ${apt.name} …`)}`;
  const maps = `https://maps.google.com/?daddr=${encodeURIComponent(`${site.street}, ${site.postalCode} ${site.city}`)}`;

  return (
    <Screen>
      <View style={styles.hero}>
        <Image source={heroImages[apt.slug]} style={styles.heroImg} contentFit="cover" />
        <View style={[styles.heroBar, { backgroundColor: apt.accent }]}>
          <Text style={styles.heroTitle}>Moin in {apt.name}!</Text>
          <Text style={styles.heroSub}>
            {apt.view}
            {apt.floor ? ` · ${apt.floor}` : ''}
          </Text>
        </View>
      </View>

      <ActionRow>
        <Action label="WhatsApp" icon="💬" url={wa} />
        <Action label="Anrufen" icon="📞" url={`tel:${site.phone}`} />
        <Action label="Route" icon="🧭" url={maps} />
      </ActionRow>
      <Muted>Kein Callcenter — am anderen Ende ist Iris.</Muted>

      <WeatherPill />

      {/* Das Herzstück: der Aktivitäten-Swiper */}
      <Pressable
        onPress={() => router.push(plan.length > 0 ? '/plan' : '/entdecken')}
        style={({ pressed }) => [styles.discover, pressed && styles.pressed]}
      >
        <Text style={styles.discoverIcon}>🃏</Text>
        <View style={styles.discoverText}>
          <Text style={styles.discoverTitle}>Was machen wir heute?</Text>
          <Text style={styles.discoverSub}>
            {plan.length > 0
              ? `Euer Plan: ${plan.length} ${plan.length === 1 ? 'Idee' : 'Ideen'} — und Nachschub per Swipe`
              : 'Swipt euch durch Büsum — wie Tinder, nur mit Watt'}
          </Text>
        </View>
        <Text style={styles.discoverChevron}>›</Text>
      </Pressable>

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <Pressable
            key={t.href}
            onPress={() => router.push(t.href)}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <Text style={styles.tileIcon}>{t.icon}</Text>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, overflow: 'hidden' },
  heroImg: { width: '100%', height: 180 },
  heroBar: { padding: spacing.md, gap: 2 },
  heroTitle: { fontFamily: fonts.head, fontSize: 24, color: colors.white },
  heroSub: { color: 'rgba(255,255,255,0.88)', fontSize: 13 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 88,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  tileIcon: { fontSize: 22 },
  tileLabel: { fontSize: 15, fontWeight: '600', color: colors.aqua900 },
  discover: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.aqua900,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 84,
  },
  discoverIcon: { fontSize: 34 },
  discoverText: { flex: 1, gap: 3 },
  discoverTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.white },
  discoverSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  discoverChevron: { fontSize: 30, color: colors.gold },
});
