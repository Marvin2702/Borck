// =========================================================================
// Einstieg: Ist eine Wohnung gespeichert (oder kam ein Deep Link), geht es
// direkt dorthin — sonst freundliche Wohnungswahl (7 Kacheln mit Akzentfarbe).
// =========================================================================
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LanguagePills } from '../components/LanguagePills';
import { Muted, Screen } from '../components/ui';
import { content } from '../content';
import { heroImages } from '../heroImages';
import { useGuest, useT } from '../lib/store';
import { colors, fonts, radius, spacing } from '../theme';

export default function ChooseApartment() {
  const { apartment, setApartment } = useGuest();
  const { t } = useT();
  if (apartment) return <Redirect href={{ pathname: '/wohnung/[slug]', params: { slug: apartment } }} />;

  return (
    <Screen>
      <LanguagePills compact />
      <Text style={styles.hello}>{t('chooser.hello')}</Text>
      <Muted>{t('chooser.which')}</Muted>
      <View style={styles.grid}>
        {content.apartments.map((a) => (
          <Pressable
            key={a.slug}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => {
              setApartment(a.slug);
              router.replace({ pathname: '/wohnung/[slug]', params: { slug: a.slug } });
            }}
          >
            <Image source={heroImages[a.slug]} style={styles.tileImg} contentFit="cover" transition={150} />
            <View style={[styles.tileBar, { backgroundColor: a.accent }]}>
              <Text style={styles.tileName}>{a.name}</Text>
              <Text style={styles.tileView}>{a.view}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontFamily: fonts.head, fontSize: 28, color: colors.aqua900 },
  grid: { gap: spacing.md },
  tile: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.white },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  tileImg: { width: '100%', height: 140 },
  tileBar: { padding: spacing.md, gap: 2 },
  tileName: { fontFamily: fonts.head, fontSize: 20, color: colors.white },
  tileView: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
});
