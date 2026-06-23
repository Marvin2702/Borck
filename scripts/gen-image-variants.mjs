// Erzeugt responsive Bildvarianten (640/1024/1600px) je Foto in AVIF, WebP und JPG
// für <picture> + srcset. Nutzung: node scripts/gen-image-variants.mjs
import sharp from 'sharp';
import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

const dir = 'public/images';
const skip = new Set(['og-default.jpg']); // OG bleibt 1200x630-JPG
const widths = [640, 1024, 1600];

let count = 0;
for (const f of await readdir(dir)) {
  if (!/\.jpe?g$/i.test(f) || skip.has(f)) continue;
  // bereits erzeugte Breiten-Varianten (…-640/-1024/-1600.jpg) überspringen,
  // aber NICHT die Quellbilder mit -1/-2/-3-Suffix (topas-2.jpg etc.)
  if (/-(640|1024|1600)\.jpe?g$/i.test(f)) continue;

  const base = f.replace(/\.jpe?g$/i, '');
  const input = await readFile(path.join(dir, f));
  const made = [];
  for (const w of widths) {
    // leichtes Hochskalieren erlaubt, damit jeder srcset-Kandidat existiert
    const pipe = sharp(input).resize({ width: w });
    await pipe.clone().avif({ quality: 50 }).toFile(path.join(dir, `${base}-${w}.avif`));
    await pipe.clone().webp({ quality: 72 }).toFile(path.join(dir, `${base}-${w}.webp`));
    await pipe.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(dir, `${base}-${w}.jpg`));
    made.push(w);
  }
  // alte breitenlose AVIF/WebP entfernen (durch Breiten-Varianten ersetzt)
  for (const ext of ['avif', 'webp']) await rm(path.join(dir, `${base}.${ext}`), { force: true });
  count++;
  console.log(`${base}: ${made.join('/')} (avif/webp/jpg)`);
}
console.log(`Fertig: ${count} Bilder.`);
