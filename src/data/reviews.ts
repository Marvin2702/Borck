// =========================================================================
// Anzeige-Regel für Gäste-Bewertungen: neueste zuerst (ohne verifiziertes
// Datum ans Ende), maximal 10. Es findet bewusst kein Rating-Gating statt.
// =========================================================================
import { getCollection } from 'astro:content';

export async function getDisplayReviews() {
  return (await getCollection('reviews'))
    .sort((a, b) => (b.data.date ?? '').localeCompare(a.data.date ?? ''))
    .slice(0, 10);
}
