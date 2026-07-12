// Wetter-Klassifikation (Büsum: Wind zählt!) und Badge-Regeln.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluateBadges } from '../lib/badges';
import { classify, getWeather, parseOpenMeteo } from '../lib/weather';

const day = (over: Partial<{ code: number; precipProb: number; windMax: number }>) => ({
  date: '2026-07-14',
  code: 1,
  tmax: 19,
  precipProb: 10,
  windMax: 15,
  ...over,
});

describe('classify', () => {
  it('Regen-Code ⇒ Schietwetter', () => expect(classify(day({ code: 61 }))).toBe('schietwetter'));
  it('hohe Regenwahrscheinlichkeit ⇒ Schietwetter', () =>
    expect(classify(day({ precipProb: 70 }))).toBe('schietwetter'));
  it('Sturm ⇒ Schietwetter (auch ohne Regen)', () => expect(classify(day({ windMax: 45 }))).toBe('schietwetter'));
  it('klar ⇒ Sonne', () => expect(classify(day({ code: 0 }))).toBe('sonne'));
  it('bedeckt ⇒ Wolken', () => expect(classify(day({ code: 3 }))).toBe('wolken'));
});

describe('parseOpenMeteo', () => {
  it('mappt das daily-Format', () => {
    const parsed = parseOpenMeteo({
      daily: {
        time: ['2026-07-14'],
        weather_code: [61],
        temperature_2m_max: [17.6],
        precipitation_probability_max: [80],
        wind_speed_10m_max: [38.4],
      },
    });
    expect(parsed).toEqual([{ date: '2026-07-14', code: 61, tmax: 18, precipProb: 80, windMax: 38 }]);
  });
  it('liefert [] bei kaputtem Payload', () => expect(parseOpenMeteo({})).toEqual([]));
});

describe('getWeather', () => {
  it('bleibt ohne lizenzierte Wetterquelle vollständig lokal und deaktiviert', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as typeof fetch;
    jest.clearAllMocks();

    try {
      await expect(getWeather()).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('evaluateBadges', () => {
  it('ohne Check-ins keine Badges', () => expect(evaluateBadges({})).toEqual([]));

  it('erster Check-in ⇒ „Moin!"', () => {
    expect(evaluateBadges({ 'promenaden-bummel': { date: 'x' } })).toContain('moin');
  });

  it('Watt-Checkin ⇒ Wattläufer; Schietwetter eingefroren ⇒ Held', () => {
    const earned = evaluateBadges({
      'wattwanderung-schutzstation': { date: 'x', weather: 'schietwetter' },
    });
    expect(earned).toEqual(expect.arrayContaining(['moin', 'wattlaeufer', 'schietwetter-held']));
  });

  it('Ausflug >10 km ⇒ Landratte (Seehundstation Friedrichskoog)', () => {
    expect(evaluateBadges({ 'seehundstation-friedrichskoog': { date: 'x' } })).toContain('landratte');
  });

  it('fünf Check-ins ⇒ Büsum-Profi', () => {
    const five = Object.fromEntries(
      ['perlebucht-lagune', 'hafen-leuchtturm', 'promenaden-bummel', 'meerzeit-wellenbad', 'adventure-golf'].map(
        (id) => [id, { date: 'x' }]
      )
    );
    expect(evaluateBadges(five)).toContain('buesum-profi');
  });
});
