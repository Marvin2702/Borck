// =========================================================================
// 2-Tap-Service-Anfragen an Iris (Ketten-App-Niveau, ohne Backend):
// vorbefüllte WhatsApp-Nachrichten. {wohnung} wird automatisch ersetzt.
// Iris kann Texte anpassen; Einträge mit „TODO" zeigt die App als Hinweis.
// =========================================================================
export type ServiceRequest = {
  id: string;
  icon: string;
  label: string;
  hint: string;
  template: string; // {wohnung} wird ersetzt
};

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'late-checkout',
    icon: '🕐',
    label: 'Late-Checkout anfragen',
    hint: 'Wenn es am Abreisetag etwas später werden soll',
    template: 'Moin Iris! Wir sind in {wohnung} — wäre am Abreisetag ein späterer Check-out möglich? 🙂',
  },
  {
    id: 'waesche',
    icon: '🧻',
    label: 'Frische Handtücher / Bettwäsche',
    hint: 'Nachschub gegen Gebühr (siehe Gästemappe)',
    template: 'Moin Iris! Wir sind in {wohnung} — könnten wir frische Handtücher/Bettwäsche bekommen?',
  },
  {
    id: 'broetchen',
    icon: '🥐',
    label: 'Brötchen-Frage',
    hint: 'Wo gibt es morgens die besten Brötchen?',
    template: 'Moin Iris! Kurze Frage aus {wohnung}: Wo bekommen wir morgen früh am besten Brötchen? 🥐',
  },
  {
    id: 'problem',
    icon: '🔧',
    label: 'Problem melden',
    hint: 'Etwas kaputt oder klemmt? Iris kümmert sich.',
    template: 'Moin Iris! In {wohnung} gibt es ein kleines Problem: ',
  },
  {
    id: 'nochmal',
    icon: '💙',
    label: 'Nochmal buchen',
    hint: 'Lieblingswohnung fürs nächste Mal anfragen — direkt, ohne Portalgebühr',
    template: 'Moin Iris! Uns gefällt es in {wohnung} richtig gut — wir würden gern fürs nächste Mal direkt bei euch reservieren. 💙',
  },
];
