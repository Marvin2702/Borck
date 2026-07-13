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
import { useGuest, useT } from '../../lib/store';
import { localeTag } from '../../i18n';
import { colors, fonts, radius, spacing } from '../../theme';

export default function EntdeckenIntro() {
  const [resumable, setResumable] = useState<Session | null>(null);
  const { plan } = useGuest();
  const { t, lang } = useT();

  useFocusEffect(
    useCallback(() => {
      loadSession().then(setResumable);
    }, [])
  );

  const start = (mode: 'solo' | 'duo') => {
    const names: [string, string] =
      mode === 'duo' ? [t('discover.player1'), t('discover.player2')] : [t('discover.you'), ''];
    const session = createSession(mode, Math.floor(Math.random() * 1e9), names);
    saveSession(session);
    router.push('/entdecken/swipe');
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('discover.title')}</Text>
      <Muted>{t('discover.intro', { n: content.activities.length })}</Muted>

      {resumable && (
        <Card style={styles.resume}>
          <Pressable onPress={() => router.push('/entdecken/swipe')}>
            <Text style={styles.resumeTitle}>{t('discover.resume')}</Text>
            <Muted>
              {resumable.mode === 'duo' ? t('discover.duoShort') : t('discover.soloShort')} ·{' '}
              {t('discover.startedOn', { date: new Date(resumable.startedAt).toLocaleDateString(localeTag[lang]) })}
            </Muted>
          </Pressable>
          <Pressable
            onPress={() => {
              saveSession(null);
              setResumable(null);
            }}
            style={styles.discard}
          >
            <Text style={styles.discardLabel}>{t('discover.discard')}</Text>
          </Pressable>
        </Card>
      )}

      <SectionTitle>{t('discover.how')}</SectionTitle>
      <Pressable onPress={() => start('duo')} style={({ pressed }) => pressed && styles.pressed}>
        <Card style={styles.duo}>
          <Text style={styles.modeIcon}>🦭🦀</Text>
          <Text style={styles.modeTitle}>{t('discover.duoTitle')}</Text>
          <Muted>{t('discover.duoText')}</Muted>
        </Card>
      </Pressable>
      <Pressable onPress={() => start('solo')} style={({ pressed }) => pressed && styles.pressed}>
        <Card>
          <Text style={styles.modeIcon}>🧭</Text>
          <Text style={styles.modeTitle}>{t('discover.soloTitle')}</Text>
          <Muted>{t('discover.soloText')}</Muted>
        </Card>
      </Pressable>

      {plan.length > 0 && (
        <Pressable onPress={() => router.push('/plan')}>
          <Muted>{plan.length === 1 ? t('discover.planTeaser1') : t('discover.planTeaserN', { n: plan.length })}</Muted>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.head, fontSize: 28, color: colors.aqua900 },
  resume: { backgroundColor: colors.aqua100 },
  resumeTitle: { fontWeight: '700', color: colors.aqua900, fontSize: 16 },
  discard: { paddingTop: spacing.sm, minHeight: 36, justifyContent: 'center' },
  discardLabel: { color: '#a64b50', fontWeight: '600', fontSize: 13.5 },
  duo: { borderColor: colors.gold, borderWidth: 1.5, borderRadius: radius.lg },
  modeIcon: { fontSize: 30 },
  modeTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.aqua900, marginTop: spacing.xs },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
