// Render-Smoke des nativen Guide-Renderers (kein WebView, Apple 4.2).
import { render, screen } from '@testing-library/react-native';
import { Blocks } from '../components/Blocks';
import { content } from '../content';

describe('Blocks-Renderer', () => {
  it('rendert einen kompletten Guide inkl. Überschriften und Listen', async () => {
    const guide = content.guides[0];
    await render(<Blocks blocks={guide.blocks} />);
    const firstHeading = guide.blocks.find((b) => b.t === 'h2' || b.t === 'h3');
    if (firstHeading) {
      expect(screen.getByText(firstHeading.spans.map((s) => s.text).join(''))).toBeTruthy();
    }
  });

  it('rendert Bold- und Link-Spans', async () => {
    await render(
      <Blocks
        blocks={[
          { t: 'p', spans: [{ text: 'Watt ', bold: true }, { text: 'erleben', href: 'https://example.com' }] },
          { t: 'li', spans: [{ text: 'Gummistiefel' }] },
        ]}
      />
    );
    expect(screen.getByText('Watt ')).toBeTruthy();
    expect(screen.getByText('erleben')).toBeTruthy();
    expect(screen.getByText('Gummistiefel')).toBeTruthy();
  });
});
