// =========================================================================
// "ab"-Preise je Smoobu-Objekt. Wird zur Build-Zeit von scripts/fetch-prices.mjs
// aus der Smoobu-API befüllt (prices.json). Ohne API-Key bleibt es leer und die
// Karten zeigen "Preis je nach Zeitraum".
// Snapshots älter als 7 Tage werden nicht mehr als aktuelle „ab“-Preise
// ausgespielt. Der offizielle Smoobu-Kalender bleibt die Preisquelle.
// =========================================================================
import pricesRaw from './prices.json';

type PriceSnapshot = { updatedAt: string; prices: Record<string, number> };
const snapshot = pricesRaw as PriceSnapshot;
const updatedAt = Date.parse(snapshot.updatedAt);
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const pricesAreFresh = Number.isFinite(updatedAt) && Date.now() - updatedAt <= MAX_AGE_MS;
export const pricesUpdatedAt = snapshot.updatedAt;

/** Niedrigster bekannter "ab"-Preis (Smoobu) oder Fallback aus dem Frontmatter. */
export function priceFrom(smoobuId?: string, fallback?: number): number | undefined {
  if (pricesAreFresh && smoobuId && typeof snapshot.prices[smoobuId] === 'number') return snapshot.prices[smoobuId];
  return fallback;
}
