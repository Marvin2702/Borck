import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url).pathname;
const OUT = path.join(ROOT, 'public/images');
const SITE = 'https://www.nordsee-buesum-fewo.de';

// Bewusst kuratierte Auswahl: vollständige Raumabdeckung statt ähnlicher
// Perspektiven und Detailserien einzelner Küchengeräte.
const selection = {
  bernstein: [
    ['living-terrace', '01-haus-aquamarin-urlaub-buesum-apartment-nordsee-essbereich-mit-ausblicke-terrasse-Bernstein'],
    ['sofa', '03-haus+Aquamarin-Urlaub-Buesum-Ferienwohnung-Strand-Nordsee-Bernstein-Sitzbereich'],
    ['dining', '05-haus+aquamarin-urlaub-buesum-ferienwohnung-strand-nordsee-bernstein-essbereich'],
    ['kitchen', '04-haus+Aquamarin-Urlaub-Buesum-Ferienwohnung-Strand-Nordsee-Bernstein-Kuechenbereich'],
    ['bedroom', '06-haus+aquamarin-urlaub-buesum-ferienwohnung-strand-nordsee-bernstein-schlafzimmer'],
    ['bathroom', '07-haus+aquamarin-urlaub-buesum-ferienwohnung-strand-nordsee-bernstein-badezimmer'],
    ['entrance', '08-haus+Aquamarin-Urlaub-Buesum-Ferienwohnung-Strand-Nordsee-Bernstein-Eingangsbereich'],
  ],
  opal: [
    ['living', 'Haus-Aquamarin-Nordsee-Urlaub-Opal-blick-vom-essbereich-in-Wohnzimmerbereich-'],
    ['dyke-view', 'haus-aquamarin-familienlagune-opal-ausblick-von-balkon-direkter-deichblick'],
    ['balcony-view', 'haus-aquamarin-balkon-seitlicher-deichblick-ferienwohnung-opal'],
    ['bedroom-wardrobe', 'Haus-Aquamarin-buesum-Urlaub-Opal-schlafzimmer-kleiderschrank-mit-spiegel'],
    ['bedroom', 'Haus-Aquamarin-Nordsee-Urlaub-Opal-schlafzimmer-doppelbett'],
    ['bunk-room', 'Haus+Aquamarin-Urlaub-Buesum-Ferienwohnung-Kinderzimmer-Etagenbett-Nordsee-Opal'],
  ],
  rubin: [
    ['dining-kitchen', 'Rubin-Kueche-Essbereich-mit-vier-Sitzplaetzen'],
    ['living', 'Rubin-wohnzimmer-mit-couchgarnitur-und-fernseher-2880w'],
    ['lounge', 'Rubin-Wohnzimmerbereichreich-gemuetlich'],
    ['bedroom', 'Rubin-Schlafzimmer-mit-Blick-zum-Schrank-Betten-bezogen'],
    ['bunk-room', 'Rubin-Kinderzimmer-Etagenbett'],
    ['bathroom', 'Rubin-Badezimmer-Dusche-und-Waschtisch'],
    ['rain-shower', 'Rubin-Badezimmer-Regendusche'],
  ],
  saphir: [
    ['living', 'Saphir-Wohnzimmer-mit-Fernseher.jpeg'],
    ['open-living', 'Saphir-Blick-vom-Wohnzimmer-zur-Kueche.jpeg'],
    ['garden-view', 'Saphir-Wohnzimmer-Smart-TV-mit-Blick-in-den-Garten'],
    ['dining', 'Saphir-Essbereich-4-Sitzplaetze-mit-Blick-in-den-Garten'],
    ['kitchen', 'Saphir-Küchenbereich-Bosch-Backofen-mit-Mikrowelle'],
    ['bedroom', 'Saphir-Schlafzimmer-Doppelbett-Bild-mit-Sonnenuntergang'],
    ['bunk-room', 'Saphir-Kinderzimmer-mit-Etagenbett'],
    ['bathroom', 'Saphir-Blick.ins-kleine-Duschbad'],
  ],
  smaragd: [
    ['living', 'Smaragd-Wohnbereich-Essbereich-Smart-TV-819df8ee'],
    ['open-studio', 'Smaragd-Wohnbereich-Essbereich-Kueche-Blickwinkel-Fenster-Balkon-a5b8dbdc'],
    ['sleeping-area', 'Smaragd-Schlafbereich-Fensterseite-b10a2e6a'],
    ['kitchen', 'Smaragd-Kuechenbereich-seitlich-aa115c1f'],
    ['balcony-view', 'Smaragd-Balkon-mit-Blick-zum-Deich-Meer-Nordsee-Urlaub'],
    ['balcony', 'Haus-Aquamarin-Smaragd-Balkon-mit-Gartenmoebel'],
    ['bathroom', 'Smaragd-mit-Balkon-Badezimmer-Waschbecken-mit-Dusche-Blick-hinein'],
  ],
  topas: [
    ['living-view', 'topas-nordseeblick-vom-Wohnzimmerbereich-zum-balkon-ad297c88'],
    ['sea-view', 'topas-meerblick'],
    ['dining-kids', 'topas-essbereich-mit-blick-ins-kinderzimmer-3-betten'],
    ['bedroom', 'topas-schlafzimmer-doppelbett-180'],
    ['kids-room', 'topas-schlafzimmer-kinderzimmer-3-betten-seeseite-links'],
    ['bathroom', 'topas-duschbad-waschbecken-seeseite'],
    ['kitchen', 'topas-kuechenzeile-mikrowelle-mit-grillfunktion'],
  ],
  tuerkis: [
    ['dining', 'Tuerkis-Essbereich-aus-Blickwinkel-Kuechejpeg-a63d4399-4a4cb082'],
    ['living-kitchen', 'Tuerkis-Wohnzimmer-mit-Blick-auf-die-Kueche'],
    ['living-tv', 'Tuerkis-Wohnbereich-SmartTV-frontal'],
    ['dining-living', 'Tuerkis-Essbereich-aus-Blickwinkel-Wohnbereich'],
    ['bedroom', 'Tuerkis-Schlafzimmer-Doppelbett'],
    ['kitchen', 'Tuerkis-Essbereich-Kuechenbereich'],
    ['bunk-room', 'Tuerkis-Kinderzimmer-Hochbett-Etagenbett'],
  ],
};

function imageUrls(html) {
  return [...html.replaceAll('&amp;', '&').matchAll(/https:\/\/[^"' ]+\.(?:jpe?g|png|webp)/gi)].map((m) => m[0]);
}

function decoded(url) {
  try { return decodeURIComponent(url); } catch { return url; }
}

function chooseUrl(urls, token) {
  const matches = urls.filter((url) => decoded(url).toLowerCase().includes(token.toLowerCase()));
  const preferred = matches.find((url) => /le-de\.cdn-website\.com/.test(url) && /-1920w\./i.test(url))
    ?? matches.find((url) => /le-de\.cdn-website\.com/.test(url) && /-2880w\./i.test(url))
    ?? matches.find((url) => /de\.cdn-website\.com/.test(url));
  if (!preferred) throw new Error(`Keine Quelle für ${token}`);
  return preferred;
}

await fs.mkdir(OUT, { recursive: true });

for (const [apartment, items] of Object.entries(selection)) {
  const response = await fetch(`${SITE}/${apartment}`);
  if (!response.ok) throw new Error(`${apartment}: HTTP ${response.status}`);
  const urls = imageUrls(await response.text());

  for (const [slug, token] of items) {
    const sourceUrl = chooseUrl(urls, token);
    const imageResponse = await fetch(sourceUrl);
    if (!imageResponse.ok) throw new Error(`${apartment}-${slug}: HTTP ${imageResponse.status}`);
    const input = Buffer.from(await imageResponse.arrayBuffer());
    const base = path.join(OUT, `${apartment}-${slug}`);
    const meta = await sharp(input).metadata();
    if (!meta.width || meta.width < 1000) throw new Error(`${apartment}-${slug}: Quelle zu klein (${meta.width ?? '?'})`);

    await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(`${base}.jpg`);
    for (const width of [640, 1024, 1600]) {
      await Promise.all([
        sharp(input).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(`${base}-${width}.jpg`),
        sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(`${base}-${width}.webp`),
        sharp(input).rotate().resize({ width, withoutEnlargement: true }).avif({ quality: 55, effort: 6 }).toFile(`${base}-${width}.avif`),
      ]);
    }
    console.log(`${apartment}-${slug}: ${meta.width}×${meta.height} <- ${sourceUrl}`);
  }
}
