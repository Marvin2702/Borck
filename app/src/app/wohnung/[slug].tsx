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
import { useGuest, useT } from '../../lib/store';
import { colors, fonts, radius, spacing } from '../../theme';

const tiles = [
  { href: '/checkin', icon: '🔑', label: 'tile.checkin' },
  { href: '/wlan', icon: '📶', label: 'tile.wifi' },
  { href: '/mappe', icon: '📖', label: 'tile.mappe' },
  { href: '/service', icon: '🛎️', label: 'tile.service' },
  { href: '/heute', icon: '📘', label: 'tile.tips' },
  { href: '/gezeiten', icon: '🌙', label: 'tile.tides' },
  { href: '/album', icon: '🎖️', label: 'tile.album' },
  { href: '/meilensteine', icon: '🏆', label: 'tile.milestones' },
  { href: '/notfall', icon: '⛑️', label: 'tile.emergency' },
  { href: '/abreise', icon: '👋', label: 'tile.departure' },
  { href: '/einstellungen', icon: '⚙️', label: 'tile.settings' },
] as const;

export function generateStaticParams() {
  return content.apartments.map(({ slug }) => ({ slug }));
}

export default function ApartmentHome() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { apartment, setApartment, plan } = useGuest();
  const { t } = useT();
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
          <Text style={styles.heroTitle}>{t('home.moinIn', { name: apt.name })}</Text>
          <Text style={styles.heroSub}>
            {apt.view}
            {apt.floor ? ` · ${apt.floor}` : ''}
          </Text>
        </View>
      </View>

      <ActionRow>
        <Action label={t('home.whatsapp')} icon="💬" url={wa} />
        <Action label={t('home.call')} icon="📞" url={`tel:${site.phone}`} />
        <Action label={t('home.route')} icon="🧭" url={maps} />
      </ActionRow>
      <Muted>{t('common.noCallcenter')}</Muted>

      <WeatherPill />

      {/* Das Herzstück: der Aktivitäten-Swiper — mit dem traditionellen Logo
          statt Emoji (🃏 rendert je nach Gerät als „komische" Spielkarte) */}
      <Pressable
        onPress={() => router.push(plan.length > 0 ? '/plan' : '/entdecken')}
        style={({ pressed }) => [styles.discover, pressed && styles.pressed]}
      >
        <View style={styles.discoverLogoWrap}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.discoverLogo} contentFit="contain" />
        </View>
        <View style={styles.discoverText}>
          <Text style={styles.discoverTitle}>{t('home.discoverTitle')}</Text>
          <Text style={styles.discoverSub}>
            {plan.length > 0
              ? plan.length === 1
                ? t('home.discoverSubPlan1')
                : t('home.discoverSubPlanN', { n: plan.length })
              : t('home.discoverSub')}
          </Text>
        </View>
        <Text style={styles.discoverChevron}>›</Text>
      </Pressable>

      <View style={styles.tiles}>
        {tiles.map((t2) => (
          <Pressable
            key={t2.href}
            onPress={() => router.push(t2.href)}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <Text style={styles.tileIcon}>{t2.icon}</Text>
            <Text style={styles.tileLabel}>{t(t2.label)}</Text>
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
  discoverLogoWrap: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.sand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverLogo: { width: 40, height: 40 },
  discoverText: { flex: 1, gap: 3 },
  discoverTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.white },
  discoverSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  discoverChevron: { fontSize: 30, color: colors.gold },
});
