// =========================================================================
// "ab"-Preise je Smoobu-Objekt. Wird zur Build-Zeit von scripts/fetch-prices.mjs
// aus der Smoobu-API befüllt (prices.json). Ohne API-Key bleibt es leer und die
// Karten zeigen "Preis je nach Zeitraum".
// Struktur: { "<smoobu_id>": <niedrigster €-Preis pro Nacht>, ... }
// =========================================================================
import pricesRaw from './prices.json';

const prices = pricesRaw as Record<string, number>;

/** Niedrigster bekannter "ab"-Preis (Smoobu) oder Fallback aus dem Frontmatter. */
export function priceFrom(smoobuId?: string, fallback?: number): number | undefined {
  if (smoobuId && typeof prices[smoobuId] === 'number') return prices[smoobuId];
  return fallback;
}
