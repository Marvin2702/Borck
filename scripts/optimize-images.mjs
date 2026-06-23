// Optimiert public/images: Fotos -> JPEG max 1600px (mozjpeg q80), Logo -> kleines PNG.
// Nutzung: `node scripts/optimize-images.mjs` aus dem Projektordner.
import sharp from 'sharp';
import { readdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir = 'public/images';
const skip = new Set(['favicon.svg', 'og-default.svg']);
const files = await readdir(dir);

for (const f of files) {
  if (skip.has(f)) continue;
  const ext = path.extname(f).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  const src = path.join(dir, f);
  const base = path.basename(f, ext);
  // Erst als Buffer lesen, damit Sharp keine Dateisperre auf src hält (Windows).
  const input = await readFile(src);

  if (base === 'logo') {
    const buf = await sharp(input).resize({ width: 480, withoutEnlargement: true })
      .png({ compressionLevel: 9 }).toBuffer();
    await writeFile(src, buf);
    console.log(`logo.png -> ${Math.round(buf.length / 1024)} KB`);
    continue;
  }

  const buf = await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  const outName = `${base}.jpg`;
  await writeFile(path.join(dir, outName), buf);
  if (outName !== f) await rm(src);
  console.log(`${outName} -> ${Math.round(buf.length / 1024)} KB`);
}
console.log('Fertig.');
