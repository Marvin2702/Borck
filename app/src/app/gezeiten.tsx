// Ebbe & Flut: kurze Einordnung + amtlicher BSH-Link (v1 statisch; API in v2).
import { Action, ActionRow, Body, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { gezeiten } from '../data/guestInfo';

export default function Gezeiten() {
  return (
    <Screen>
      <SectionTitle>Die Tide bestimmt den Tag</SectionTitle>
      <Card>
        <Body>{gezeiten.intro}</Body>
        <Muted>{gezeiten.hinweis}</Muted>
      </Card>
      <ActionRow>
        <Action label={gezeiten.linkLabel} icon="🌊" url={gezeiten.linkUrl} />
      </ActionRow>
      <Muted>
        Wichtig: Nie allein und ohne Gezeitenkenntnis ins Watt — geführte Wattwanderungen gibt es direkt in Büsum
        (siehe Reisetipp „Wattwandern").
      </Muted>
    </Screen>
  );
}
