// =========================================================================
// Entdecken-Einstieg: Solo oder zu zweit? Plus Resume einer unterbrochenen
// Runde. Das eigentliche Swipen passiert in entdecken/swipe.tsx.
// =========================================================================
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Muted, Screen, SectionTitle } from '../../components/ui';
import { content } from '../../content';
import { createSession, loadSession, saveSession, type Session } from '../../lib/discover';
import { useGuest } from '../../lib/store';
import { colors, fonts, radius, spacing } from '../../theme';

export default function EntdeckenIntro() {
  const [resumable, setResumable] = useState<Session | null>(null);
  const { plan } = useGuest();

  useFocusEffect(
    useCallback(() => {
      loadSession().then(setResumable);
    }, [])
  );

  const start = (mode: 'solo' | 'duo') => {
    const session = createSession(mode, Math.floor(Math.random() * 1e9));
    saveSession(session);
    router.push('/entdecken/swipe');
  };

  return (
    <Screen>
      <Text style={styles.title}>Was wollt ihr erleben?</Text>
      <Muted>
        Swipt euch durch {content.activities.length} Büsum-Ideen: rechts = wollen wir, links = nö, nach oben =
        unbedingt! Erst eine kurze Stimmungs-Runde, dann die Erlebnisse.
      </Muted>

      {resumable && (
        <Pressable onPress={() => router.push('/entdecken/swipe')}>
          <Card style={styles.resume}>
            <Text style={styles.resumeTitle}>▶︎ Angefangene Runde fortsetzen</Text>
            <Muted>
              {resumable.mode === 'duo' ? 'Zu zweit' : 'Solo'} · gestartet{' '}
              {new Date(resumable.startedAt).toLocaleDateString('de-DE')}
            </Muted>
          </Card>
        </Pressable>
      )}

      <SectionTitle>Wie swipt ihr?</SectionTitle>
      <Pressable onPress={() => start('duo')} style={({ pressed }) => pressed && styles.pressed}>
        <Card style={styles.duo}>
          <Text style={styles.modeIcon}>🦭🦀</Text>
          <Text style={styles.modeTitle}>Zu zweit — das Match-Spiel</Text>
          <Muted>
            Erst swipst du, dann dein Gegenüber am selben Handy. Am Ende zeigt die App, was ihr BEIDE wollt.
          </Muted>
        </Card>
      </Pressable>
      <Pressable onPress={() => start('solo')} style={({ pressed }) => pressed && styles.pressed}>
        <Card>
          <Text style={styles.modeIcon}>🧭</Text>
          <Text style={styles.modeTitle}>Solo entdecken</Text>
          <Muted>Deine Likes werden direkt zu eurem Urlaubsplan.</Muted>
        </Card>
      </Pressable>

      {plan.length > 0 && (
        <Pressable onPress={() => router.push('/plan')}>
          <Muted>→ Euer Urlaubsplan hat schon {plan.length} {plan.length === 1 ? 'Idee' : 'Ideen'}</Muted>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.head, fontSize: 28, color: colors.aqua900 },
  resume: { backgroundColor: colors.aqua100 },
  resumeTitle: { fontWeight: '700', color: colors.aqua900, fontSize: 16 },
  duo: { borderColor: colors.gold, borderWidth: 1.5, borderRadius: radius.lg },
  modeIcon: { fontSize: 30 },
  modeTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.aqua900, marginTop: spacing.xs },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
