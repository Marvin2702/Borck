import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

/**
 * Dokumentrahmen für den statischen Expo-Webexport. `noindex` schützt vor
 * Suchmaschinen-Treffern, ist aber ausdrücklich kein Zugriffsschutz.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="robots" content="noindex,nofollow" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
