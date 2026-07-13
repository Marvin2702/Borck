// =========================================================================
// Meilensteine: die Büsum-Bilanz der Gäste — Nächte dieses Jahr, noch
// geplante Nächte, Stammgast-Level und alle verdienten Badges auf einen
// Blick. Anreise/Abreise werden hier gepflegt; frühere Aufenthalte lassen
// sich nachtragen (alles lokal, wie der Rest der App).
// =========================================================================
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BadgeStamp } from '../components/BadgeStamp';
import { Card, Muted, Screen, SectionTitle } from '../components/ui';
import { badgeDefs } from '../data/badges';
import { type UIKey } from '../i18n';
import { guestLevel, nights, parseIsoDate, stayStats } from '../lib/stays';
import { useGuest, useT } from '../lib/store';
import { colors, fonts, radius, spacing } from '../theme';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Meilensteine() {
  const { arrival, departure, stays, badges, setArrival, setDeparture, addStay } = useGuest();
  const { t } = useT();
  const [from, setFrom] = useState(arrival ?? '');
  const [to, setTo] = useState(departure ?? '');
  const [note, setNote] = useState<string | null>(null);
  const [pastFrom, setPastFrom] = useState('');
  const [pastTo, setPastTo] = useState('');
  const [pastNote, setPastNote] = useState<string | null>(null);

  const today = todayIso();
  const year = new Date().getFullYear();
  const stats = stayStats(stays, { arrival, departure }, today, year);
  const level = guestLevel(stats.lifetimeNights);
  const earned = badgeDefs.filter((d) => badges[d.id]);
  const open = badgeDefs.filter((d) => !badges[d.id]);

  const saveCurrent = () => {
    if (!parseIsoDate(from) || !parseIsoDate(to)) {
      setNote(t('milestones.invalidDates'));
      return;
    }
    if (nights(from, to) <= 0) {
      setNote(t('milestones.departureAfter'));
      return;
    }
    setArrival(from);
    setDeparture(to);
    setNote(t('milestones.saved', { n: nights(from, to) }));
  };

  const savePast = () => {
    if (!parseIsoDate(pastFrom) || !parseIsoDate(pastTo) || nights(pastFrom, pastTo) <= 0) {
      setPastNote(t('milestones.invalidPast'));
      return;
    }
    addStay({ from: pastFrom, to: pastTo });
    setPastNote(t('milestones.pastSaved', { n: nights(pastFrom, pastTo) }));
    setPastFrom('');
    setPastTo('');
  };

  return (
    <Screen>
      {/* Bilanz-Kacheln */}
      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.spentNights}</Text>
          <Text style={styles.statLabel}>{t('milestones.nightsThisYear', { year })}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.plannedNights}</Text>
          <Text style={styles.statLabel}>{t('milestones.nightsPlanned')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.totalStays}</Text>
          <Text style={styles.statLabel}>{stats.totalStays === 1 ? t('milestones.stay1') : t('milestones.stayN')}</Text>
        </View>
      </View>

      <Card style={styles.levelCard}>
        <Text style={styles.levelIcon}>{level.icon}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.levelTitle}>{t(`level.${level.key}` as UIKey)}</Text>
          <Muted>
            {stats.lifetimeNights === 1 ? t('milestones.nightsTotal1') : t('milestones.nightsTotalN', { n: stats.lifetimeNights })}
            {level.next ? ` · ${t(`level.${level.next.key}` as UIKey, { n: level.next.n })}` : ` · ${t('milestones.maxLevel')}`}
          </Muted>
        </View>
      </Card>

      <SectionTitle>{t('milestones.currentStay')}</SectionTitle>
      <Card>
        <Muted>{t('milestones.currentStayText')}</Muted>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.input}
            value={from}
            onChangeText={setFrom}
            placeholder={t('milestones.arrivalPlaceholder', { date: today })}
            placeholderTextColor={colors.ink500}
            autoCapitalize="none"
            inputMode="numeric"
          />
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder={t('milestones.departurePlaceholder')}
            placeholderTextColor={colors.ink500}
            autoCapitalize="none"
            inputMode="numeric"
          />
        </View>
        <Pressable onPress={saveCurrent} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.btnLabel}>{t('milestones.save')}</Text>
        </Pressable>
        {note && <Muted>{note}</Muted>}
      </Card>

      <SectionTitle>{t('milestones.badges', { e: earned.length, total: badgeDefs.length })}</SectionTitle>
      {earned.length === 0 && (
        <Muted>{t('milestones.noBadges')}</Muted>
      )}
      <View style={styles.grid}>
        {[...earned, ...open].map((def, i) => (
          <BadgeStamp key={def.id} def={def} earnedAt={badges[def.id]} index={i} />
        ))}
      </View>
      <Pressable onPress={() => router.push('/album')}>
        <Text style={styles.link}>{t('milestones.toAlbum')}</Text>
      </Pressable>

      <SectionTitle>{t('milestones.addPast')}</SectionTitle>
      <Card>
        <Muted>{t('milestones.addPastText')}</Muted>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.input}
            value={pastFrom}
            onChangeText={setPastFrom}
            placeholder={t('milestones.fromPlaceholder')}
            placeholderTextColor={colors.ink500}
            autoCapitalize="none"
            inputMode="numeric"
          />
          <TextInput
            style={styles.input}
            value={pastTo}
            onChangeText={setPastTo}
            placeholder={t('milestones.toPlaceholder')}
            placeholderTextColor={colors.ink500}
            autoCapitalize="none"
            inputMode="numeric"
          />
        </View>
        <Pressable onPress={savePast} style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && { opacity: 0.85 }]}>
          <Text style={[styles.btnLabel, styles.btnGhostLabel]}>{t('milestones.addPastCta')}</Text>
        </Pressable>
        {pastNote && <Muted>{pastNote}</Muted>}
        {stays.length > 0 && (
          <Muted>
            {t('milestones.recorded')}{' '}
            {stays
              .map((s) => `${s.from.slice(0, 7)} (${nights(s.from, s.to)})`)
              .join(' · ')}
          </Muted>
        )}
      </Card>

      <Muted>{t('milestones.directNote')}</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.aqua900,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statNum: { fontFamily: fonts.head, fontSize: 30, color: colors.white },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, textAlign: 'center' },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderColor: colors.gold, borderWidth: 1.5 },
  levelIcon: { fontSize: 36 },
  levelTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.aqua900 },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
    color: colors.ink900,
    fontVariant: ['tabular-nums'],
  },
  btn: {
    backgroundColor: colors.aqua700,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnLabel: { color: colors.white, fontWeight: '600' },
  btnGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.aqua700 },
  btnGhostLabel: { color: colors.aqua700 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center', paddingVertical: spacing.sm },
  link: { color: colors.aqua700, fontWeight: '600', paddingVertical: spacing.xs },
});
