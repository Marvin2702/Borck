// Abreise: Checkliste (persistiert), Check-out-Erinnerung (lokale
// Notification, Opt-in), Google-Bewertung + Direktbuchungs-Karte.
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Action, ActionRow, Body, Card, isTodo, Muted, Screen, SectionTitle } from '../components/ui';
import { BadgeStamp } from '../components/BadgeStamp';
import { content } from '../content';
import { badgeDefs } from '../data/badges';
import { checkoutChecklist } from '../data/guestInfo';
import { checklistText } from '../i18n/content';
import { cancelCheckoutReminder, scheduleCheckoutReminder } from '../lib/notifications';
import { useGuest, useT } from '../lib/store';
import { colors, radius, spacing } from '../theme';

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export default function Abreise() {
  const { site } = content;
  const { t, lang } = useT();
  const { checklist, toggleChecklist, departure, setDeparture, reminder, setReminder, badges } = useGuest();
  const [dateInput, setDateInput] = useState(departure ?? '');
  const [reminderNote, setReminderNote] = useState<string | null>(null);
  const items = checkoutChecklist.filter((c) => !isTodo(c));

  const onToggleReminder = async (on: boolean) => {
    if (!on) {
      await cancelCheckoutReminder();
      setReminder(false);
      setReminderNote(null);
      return;
    }
    if (!isISODate(dateInput)) {
      setReminderNote(t('departure.dateFirst'));
      return;
    }
    setDeparture(dateInput);
    const ok = await scheduleCheckoutReminder(dateInput, site.checkoutTime);
    setReminder(ok);
    setReminderNote(ok ? t('departure.reminderSet') : t('departure.reminderFail'));
  };

  return (
    <Screen>
      <SectionTitle>{t('departure.checkoutBy', { time: site.checkoutTime })}</SectionTitle>
      <Card>
        {items.map((item, i) => {
          const done = checklist.includes(i);
          return (
            <Pressable
              key={i}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                toggleChecklist(i);
              }}
              style={({ pressed }) => [styles.check, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.box, done && styles.boxDone]}>{done ? '✓' : ''}</Text>
              <Text style={[styles.checkLabel, done && styles.checkDone]}>{checklistText(item, lang)}</Text>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>{t('departure.reminderTitle')}</SectionTitle>
      <Card>
        <View style={styles.reminderRow}>
          <TextInput
            value={dateInput}
            onChangeText={setDateInput}
            placeholder={t('departure.datePlaceholder')}
            placeholderTextColor={colors.ink500}
            style={styles.input}
            inputMode="numeric"
            autoCorrect={false}
          />
          <Switch
            value={reminder}
            onValueChange={onToggleReminder}
            trackColor={{ true: colors.aqua500 }}
            thumbColor={colors.white}
          />
        </View>
        {reminderNote ? <Muted>{reminderNote}</Muted> : <Muted>{t('departure.reminderDefault')}</Muted>}
      </Card>

      {Object.keys(badges).length > 0 && (
        <>
          <SectionTitle>{t('departure.stamps')}</SectionTitle>
          <View style={styles.stampRow}>
            {badgeDefs
              .filter((d) => badges[d.id])
              .map((d, i) => (
                <BadgeStamp key={d.id} def={d} earnedAt={badges[d.id]} index={i} />
              ))}
          </View>
        </>
      )}

      <SectionTitle>{t('departure.liked')}</SectionTitle>
      <Card>
        <Body>
          {Object.keys(badges).length > 1
            ? t('departure.stampsInReview', { n: Object.keys(badges).length })
            : ''}
          {t('departure.reviewAsk')}
        </Body>
        <ActionRow>
          <Action label={t('departure.reviewCta')} icon="⭐" url={site.googleProfileUrl} />
        </ActionRow>
      </Card>

      <Card style={styles.direct}>
        <Body>
          <Text style={styles.directStrong}>{t('departure.nextTimeStrong')}</Text>
          {t('departure.nextTimeText')}
        </Body>
        <ActionRow>
          <Action label={t('departure.bookDirect')} icon="🏠" url={site.bookingUrl} accent={colors.gold} />
        </ActionRow>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, minHeight: 44 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.aqua300,
    textAlign: 'center',
    lineHeight: 22,
    color: colors.white,
    fontWeight: '700',
  },
  boxDone: { backgroundColor: colors.aqua700, borderColor: colors.aqua700 },
  checkLabel: { flex: 1, fontSize: 15, color: colors.ink900 },
  checkDone: { textDecorationLine: 'line-through', color: colors.ink500 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: {
    flex: 1,
    backgroundColor: colors.sand50,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink900,
    minHeight: 44,
  },
  direct: { backgroundColor: colors.aqua100 },
  directStrong: { fontWeight: '700', color: colors.aqua900 },
  stampRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
