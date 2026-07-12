// Guide-Detail: nativer Block-Renderer für die Website-Reiseführer.
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Blocks } from '../../components/Blocks';
import { Screen } from '../../components/ui';
import { guideBySlug } from '../../content';

export default function GuideDetail() {
  const { guide } = useLocalSearchParams<{ guide: string }>();
  const g = guideBySlug(guide);
  if (!g) return <Redirect href="/heute" />;

  return (
    <Screen>
      <Stack.Screen options={{ title: `${g.icon} Reisetipp` }} />
      <Blocks blocks={[{ t: 'h2', spans: [{ text: g.title }] }, ...g.blocks]} />
    </Screen>
  );
}
