// =========================================================================
// Design-Token der Gäste-App — Quelle: ../src/styles/global.css der Website
// („Nordsee-Premium": Aquamarin / Sand / Gold). Bei einem Website-Redesign
// dort abgleichen; bewusst kopiert statt generiert (20 Werte, keine Pipeline).
// =========================================================================
import { Platform } from 'react-native';

export const colors = {
  aqua900: '#0d3b44',
  aqua700: '#155e6e',
  aqua500: '#2a8ca0',
  aqua300: '#7bc0cd',
  aqua100: '#d6ecf0',

  sand50: '#faf7f1',
  sand100: '#f3ece0',
  sand200: '#e7dcc8',

  ink900: '#18242a',
  ink700: '#33454d',
  ink500: '#5c6e75',

  gold: '#c9a24b',
  gold700: '#806018',

  white: '#ffffff',
  line: 'rgba(13, 59, 68, 0.12)',
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 } as const;
export const radius = { md: 14, lg: 22, pill: 999 } as const;

// Headline-Font: Fraunces (statischer SemiBold-Schnitt, geladen im Root-Layout).
// Body: System-Font — deckt sich mit der Website (system-ui).
export const fonts = {
  head: 'Fraunces_600SemiBold',
  headFallback: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
} as const;

export type ApartmentAccent = string;
