// =========================================================================
// Anzeige-Regel für Gäste-Bewertungen: nur 5-Sterne-Bewertungen, neueste
// zuerst (ohne date-Frontmatter = ans Ende), maximal 10. Wird von der
// sichtbaren Sektion (Reviews.astro) UND vom JSON-LD (HomeView) genutzt,
// damit Markup und sichtbare Reviews identisch bleiben (Google-Policy).
// =========================================================================
import { getCollection } from 'astro:content';

export async function getDisplayReviews() {
  return (await getCollection('reviews'))
    .filter((r) => r.data.rating === 5)
    .sort((a, b) => (b.data.date ?? '').localeCompare(a.data.date ?? ''))
    .slice(0, 10);
}
