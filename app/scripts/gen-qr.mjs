// =========================================================================
// Erzeugt druckfertige QR-Codes je Wohnung nach app/qr/. Kodiert wird die
// HTTPS-URL (nicht das Custom Scheme): Sie funktioniert auch ohne
// installierte App (Website-Brücke /gast/{slug}) und wird später per
// Universal Link direkt von der App übernommen — gedruckte Codes bleiben
// dauerhaft gültig. Aufruf: npm run gen-qr
// =========================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const APP = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const content = JSON.parse(fs.readFileSync(path.join(APP, 'assets/content.json'), 'utf8'));
const OUT = path.join(APP, 'qr');
fs.mkdirSync(OUT, { recursive: true });

for (const apt of content.apartments) {
  const url = `${content.site.websiteUrl}/gast/${apt.slug}/`;
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#0d3b44', light: '#ffffff' },
  });
  fs.writeFileSync(path.join(OUT, `${apt.slug}.svg`), svg);
  console.log(`qr/${apt.slug}.svg → ${url}`);
}
