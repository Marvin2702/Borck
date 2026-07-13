// i18n-Wächter: alle Sprachen vollständig, Platzhalter konsistent,
// Inhalts-Übersetzungen decken alle Ids ab.
import { content } from '../content';
import { badgeDefs } from '../data/badges';
import { serviceRequests } from '../data/services';
import { checkoutChecklist } from '../data/guestInfo';
import { languages, ui, type Lang, type UIKey } from '../i18n';
import { activityI18n, badgeI18n, checklistI18n, moodI18n, serviceI18n } from '../i18n/content';

const langs = Object.keys(languages) as Lang[];
const xlangs = langs.filter((l) => l !== 'de') as ('en' | 'nl' | 'da')[];
const keys = Object.keys(ui.de) as UIKey[];

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('UI-Wörterbuch', () => {
  it('jede Sprache hat jeden Key, nicht leer (außer bewusst leerem DE-Key)', () => {
    for (const lang of langs) {
      for (const key of keys) {
        const val = ui[lang][key];
        expect(typeof val).toBe('string');
        if (ui.de[key] !== '') expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it('Platzhalter stimmen in allen Sprachen mit DE überein', () => {
    for (const key of keys) {
      const ref = placeholders(ui.de[key]);
      for (const lang of xlangs) {
        expect({ key, lang, ph: placeholders(ui[lang][key]) }).toEqual({ key, lang, ph: ref });
      }
    }
  });
});

describe('Inhalts-Übersetzungen', () => {
  it('alle Aktivitäten in EN/NL/DA übersetzt (Name + Beschreibung)', () => {
    for (const lang of xlangs) {
      for (const a of content.activities) {
        const tr = activityI18n[lang][a.id];
        expect({ lang, id: a.id, ok: Boolean(tr && tr.name && tr.description) }).toEqual({
          lang,
          id: a.id,
          ok: true,
        });
      }
      // keine Waisen (Tippfehler-Schutz)
      const valid = new Set(content.activities.map((a) => a.id));
      for (const id of Object.keys(activityI18n[lang])) expect(valid.has(id)).toBe(true);
    }
  });

  it('alle Moods übersetzt', () => {
    for (const lang of xlangs) {
      for (const m of content.moods) {
        expect(Boolean(moodI18n[lang][m.id]?.label)).toBe(true);
      }
    }
  });

  it('alle Badges übersetzt', () => {
    for (const lang of xlangs) {
      for (const d of badgeDefs) {
        expect({ lang, id: d.id, ok: Boolean(badgeI18n[lang][d.id]?.title) }).toEqual({ lang, id: d.id, ok: true });
      }
    }
  });

  it('alle Service-Anfragen übersetzt', () => {
    for (const lang of xlangs) {
      for (const s of serviceRequests) {
        expect({ lang, id: s.id, ok: Boolean(serviceI18n[lang][s.id]?.label) }).toEqual({ lang, id: s.id, ok: true });
      }
    }
  });

  it('Checkliste: alle Standard-Einträge übersetzt (TODO-Zeilen ausgenommen)', () => {
    const items = checkoutChecklist.filter((c) => !/TODO\s*:/i.test(c));
    for (const lang of xlangs) {
      for (const item of items) {
        expect({ lang, item, ok: Boolean(checklistI18n[lang][item]) }).toEqual({ lang, item, ok: true });
      }
    }
  });
});
