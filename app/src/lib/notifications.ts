// =========================================================================
// Lokale Check-out-Erinnerung (kein Server, kein Push): am Abreisetag um
// 08:30 Uhr — Check-out ist bis 10:00. Opt-in durch den Gast auf dem
// Abreise-Screen; Berechtigung wird erst beim Aktivieren erfragt.
// =========================================================================
import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'gast-checkout-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Plant die Erinnerung; liefert false, wenn keine Berechtigung erteilt wurde
 *  oder das Datum in der Vergangenheit liegt. */
export async function scheduleCheckoutReminder(departureISO: string, checkoutTime: string): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  const when = new Date(`${departureISO}T08:30:00`);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return false;

  await cancelCheckoutReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Heute ist Abreisetag 🌊',
      body: `Check-out bis ${checkoutTime} Uhr — die Checkliste in der App hilft beim Abschließen. Gute Heimreise!`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
  return true;
}

export async function cancelCheckoutReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}
