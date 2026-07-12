// Anreise & Self-Check-in — Zeiten aus der Website, Schritte aus guestInfo.
import { Text } from 'react-native';
import { Body, Card, isTodo, Muted, Row, Screen, SectionTitle, TodoHint } from '../components/ui';
import { apartmentBySlug, content } from '../content';
import { perApartment } from '../data/guestInfo';
import { useGuest } from '../lib/store';

export default function Checkin() {
  const { apartment } = useGuest();
  const apt = apartmentBySlug(apartment ?? undefined);
  const info = apartment ? perApartment[apartment] : undefined;
  const { site } = content;

  return (
    <Screen>
      <Card>
        <Row title="Check-in" value={`ab ${site.checkinTime} Uhr — Anreise rund um die Uhr möglich`} />
        <Row title="Check-out" value={`bis ${site.checkoutTime} Uhr`} />
        <Row title="Adresse" value={`${site.street}, ${site.postalCode} ${site.city}`} />
        {info && !isTodo(info.parking) && <Row title="Dein Stellplatz" value={info.parking} />}
      </Card>

      <SectionTitle>So kommst du in {apt?.name ?? 'deine Wohnung'}</SectionTitle>
      <Card>
        {info && !info.checkinSteps.some(isTodo) ? (
          info.checkinSteps.map((step, i) => (
            <Body key={i}>
              {i + 1}. {step}
            </Body>
          ))
        ) : (
          <TodoHint />
        )}
        <Muted>
          Klemmt etwas? Ruf einfach an: {site.phoneDisplay} — Iris hilft sofort.
        </Muted>
      </Card>

      <SectionTitle>Entfernungen</SectionTitle>
      <Card>
        {content.orientation.map((o) => (
          <Row key={o.name} title={o.name} value={`ca. ${String(o.km).replace('.', ',')} km`} />
        ))}
        <Text />
      </Card>
    </Screen>
  );
}
