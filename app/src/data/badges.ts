// =========================================================================
// Sammelalbum-Badges. Bedingungen werden in lib/badges.ts ausgewertet —
// hier nur die (Iris-verständlichen) Definitionen.
// =========================================================================
export type BadgeDef = {
  id: string;
  icon: string;
  title: string;
  hint: string; // wie man ihn bekommt (im Album sichtbar, macht Lust)
};

export const badgeDefs: BadgeDef[] = [
  { id: 'moin', icon: '👋', title: 'Moin!', hint: 'Euer erstes Erlebnis abgehakt' },
  { id: 'wattlaeufer', icon: '🥾', title: 'Wattläufer', hint: 'Einmal ins Weltnaturerbe Watt' },
  { id: 'seehund-spotter', icon: '🦭', title: 'Seehund-Spotter', hint: 'Seehunde in echt gesehen' },
  { id: 'leuchtturm-fan', icon: '🚨', title: 'Leuchtturm-Fan', hint: 'Hafen & Leuchtturm besucht' },
  { id: 'wellenreiter', icon: '🌊', title: 'Wellenreiter', hint: 'Baden, Wellen oder Brett — Hauptsache nass' },
  { id: 'schietwetter-held', icon: '🌧️', title: 'Schietwetter-Held', hint: 'Bei echtem Schietwetter losgezogen' },
  { id: 'landratte', icon: '🗺️', title: 'Entdecker-Landratte', hint: 'Ein Ausflug weiter als 10 km' },
  { id: 'buesum-profi', icon: '⭐', title: 'Büsum-Profi', hint: 'Fünf Erlebnisse abgehakt' },
];
