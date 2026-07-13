// Ebbe & Flut: kurze Einordnung + amtlicher BSH-Link (v1 statisch; API in v2).
import { Action, ActionRow, Body, Card, Muted, Screen, SectionTitle } from '../components/ui';
import { gezeiten } from '../data/guestInfo';
import { useT } from '../lib/store';

export default function Gezeiten() {
  const { t } = useT();
  return (
    <Screen>
      <SectionTitle>{t('tides.headline')}</SectionTitle>
      <Card>
        <Body>{t('tides.intro')}</Body>
        <Muted>{t('tides.note')}</Muted>
      </Card>
      <ActionRow>
        <Action label={t('tides.link')} icon="🌊" url={gezeiten.linkUrl} />
      </ActionRow>
      <Muted>{t('tides.warning')}</Muted>
    </Screen>
  );
}
