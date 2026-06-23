// Erzeugt AVIF- und WebP-Varianten aller Foto-JPGs in public/images
// (für moderne Format-Aushandlung via <picture>). Nutzung: node scripts/gen-image-variants.mjs
import sharp from 'sharp';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir = 'public/images';
const skip = new Set(['og-default.jpg']); // OG bleibt JPG (Social-Kompatibilität)

let count = 0;
for (const f of await readdir(dir)) {
  if (!/\.jpe?g$/i.test(f) || skip.has(f)) continue;
  const base = f.replace(/\.jpe?g$/i, '');
  const input = await readFile(path.join(dir, f));
  await sharp(input).webp({ quality: 72 }).toFile(path.join(dir, `${base}.webp`));
  await sharp(input).avif({ quality: 55 }).toFile(path.join(dir, `${base}.avif`));
  count++;
  console.log(`${base}: webp + avif`);
}
console.log(`Fertig: ${count} Bilder.`);
