// Anreise & Self-Check-in — Zeiten aus der Website, Schritte aus guestInfo.
import { Text } from 'react-native';
import { Body, Card, GermanContentHint, isTodo, Muted, Row, Screen, SectionTitle, TodoHint } from '../components/ui';
import { apartmentBySlug, content } from '../content';
import { perApartment } from '../data/guestInfo';
import { fmtKm } from '../i18n';
import { useGuest, useT } from '../lib/store';

export default function Checkin() {
  const { apartment } = useGuest();
  const { t, lang } = useT();
  const apt = apartmentBySlug(apartment ?? undefined);
  const info = apartment ? perApartment[apartment] : undefined;
  const { site } = content;

  return (
    <Screen>
      <Card>
        <Row title={t('checkin.checkin')} value={t('checkin.from', { time: site.checkinTime })} />
        <Row title={t('checkin.checkout')} value={t('checkin.until', { time: site.checkoutTime })} />
        <Row title={t('checkin.address')} value={`${site.street}, ${site.postalCode} ${site.city}`} />
        {info && !isTodo(info.parking) && <Row title={t('checkin.parking')} value={info.parking} />}
      </Card>

      <SectionTitle>{t('checkin.how', { name: apt?.name ?? t('checkin.yourApt') })}</SectionTitle>
      <Card>
        {info && !info.checkinSteps.some(isTodo) ? (
          <>
            {info.checkinSteps.map((step, i) => (
              <Body key={i}>
                {i + 1}. {step}
              </Body>
            ))}
            <GermanContentHint />
          </>
        ) : (
          <TodoHint />
        )}
        <Muted>{t('checkin.help', { phone: site.phoneDisplay })}</Muted>
      </Card>

      <SectionTitle>{t('checkin.distances')}</SectionTitle>
      <Card>
        {content.orientation.map((o) => (
          <Row key={o.name} title={o.name} value={t('common.km', { km: fmtKm(o.km, lang) })} />
        ))}
        <Text />
      </Card>
    </Screen>
  );
}
