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
import { cancelCheckoutReminder, scheduleCheckoutReminder } from '../lib/notifications';
import { useGuest } from '../lib/store';
import { colors, radius, spacing } from '../theme';

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export default function Abreise() {
  const { site } = content;
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
      setReminderNote('Bitte zuerst das Abreisedatum eintragen (JJJJ-MM-TT).');
      return;
    }
    setDeparture(dateInput);
    const ok = await scheduleCheckoutReminder(dateInput, site.checkoutTime);
    setReminder(ok);
    setReminderNote(
      ok
        ? 'Alles klar — wir erinnern dich am Abreisetag um 8:30 Uhr.'
        : 'Erinnerung konnte nicht gesetzt werden (Berechtigung fehlt oder Datum liegt in der Vergangenheit).'
    );
  };

  return (
    <Screen>
      <SectionTitle>Check-out bis {site.checkoutTime} Uhr</SectionTitle>
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
              <Text style={[styles.checkLabel, done && styles.checkDone]}>{item}</Text>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Erinnerung am Abreisetag</SectionTitle>
      <Card>
        <View style={styles.reminderRow}>
          <TextInput
            value={dateInput}
            onChangeText={setDateInput}
            placeholder="Abreisedatum: 2026-08-15"
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
        {reminderNote ? <Muted>{reminderNote}</Muted> : <Muted>Wir melden uns um 8:30 Uhr — ganz ohne Server, direkt vom Handy.</Muted>}
      </Card>

      {Object.keys(badges).length > 0 && (
        <>
          <SectionTitle>Euer Urlaub in Stempeln</SectionTitle>
          <View style={styles.stampRow}>
            {badgeDefs
              .filter((d) => badges[d.id])
              .map((d, i) => (
                <BadgeStamp key={d.id} def={d} earnedAt={badges[d.id]} index={i} />
              ))}
          </View>
        </>
      )}

      <SectionTitle>Hat es euch gefallen?</SectionTitle>
      <Card>
        <Body>
          {Object.keys(badges).length > 1
            ? `${Object.keys(badges).length} Stempel gesammelt — erzählt in eurer Bewertung davon! `
            : ''}
          Eine Google-Bewertung hilft unserem kleinen Familienbetrieb mehr als jede Werbung — danke! 💙
        </Body>
        <ActionRow>
          <Action label="Bei Google bewerten" icon="⭐" url={site.googleProfileUrl} />
        </ActionRow>
      </Card>

      <Card style={styles.direct}>
        <Body>
          <Text style={styles.directStrong}>Bis zum nächsten Mal? </Text>
          Direkt bei uns buchen ist immer ohne Portalgebühr — und ihr habt eure Lieblingswohnung zuerst.
        </Body>
        <ActionRow>
          <Action label="Direkt buchen" icon="🏠" url={site.bookingUrl} accent={colors.gold} />
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
